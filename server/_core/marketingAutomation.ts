import { sendEmail, sendBookingConfirmation, sendShoutApproval, sendNewsletterWelcome } from './email';
import { db } from '../db';
import { users, mixPlays, shouts } from '../../drizzle/schema';
import { sql, and, gte, lte, desc } from 'drizzle-orm';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template: string;
  segment: 'all' | 'active' | 'inactive' | 'new' | 'vip';
  status: 'draft' | 'scheduled' | 'sending' | 'sent';
  scheduledAt?: Date;
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userId: number, email: string, name: string) {
  await sendNewsletterWelcome(email, name);
  console.log(`[Marketing] Welcome email sent to ${email}`);
}

/**
 * Send re-engagement email to inactive users
 */
export async function sendReEngagementCampaign() {
  // Find users who haven't been active in 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const inactiveUsers = await db.execute(sql`
    SELECT u.id, u.email, u.name
    FROM users u
    WHERE u.id NOT IN (
      SELECT DISTINCT user_id FROM mix_plays WHERE played_at >= ${fourteenDaysAgo}
    )
    AND u.id IN (
      SELECT DISTINCT user_id FROM mix_plays WHERE played_at < ${fourteenDaysAgo}
    )
    AND u.email IS NOT NULL
    LIMIT 100
  `);

  let sent = 0;
  for (const user of inactiveUsers.rows) {
    try {
      await sendEmail({
        to: user.email,
        subject: "We Miss You at Hectic Radio! 🎧",
        html: generateReEngagementEmail(user.name || 'Listener'),
      });
      sent++;
    } catch (error) {
      console.error(`[Marketing] Failed to send re-engagement email to ${user.email}:`, error);
    }
  }

  console.log(`[Marketing] Re-engagement campaign sent to ${sent} users`);
  return { sent, total: inactiveUsers.rows.length };
}

/**
 * Send abandoned cart recovery (for products)
 */
export async function sendAbandonedCartReminder(userId: number, productName: string) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (!user?.email) return;

  await sendEmail({
    to: user.email,
    subject: `Still interested in ${productName}?`,
    html: generateAbandonedCartEmail(user.name || 'there', productName),
  });

  console.log(`[Marketing] Abandoned cart email sent to ${user.email}`);
}

/**
 * Send personalized content recommendations
 */
export async function sendWeeklyDigest() {
  // Get active users
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const activeUsers = await db.execute(sql`
    SELECT DISTINCT u.id, u.email, u.name
    FROM users u
    INNER JOIN mix_plays mp ON u.id = mp.user_id
    WHERE mp.played_at >= ${sevenDaysAgo}
    AND u.email IS NOT NULL
    LIMIT 500
  `);

  let sent = 0;
  for (const user of activeUsers.rows) {
    try {
      // Get personalized recommendations for this user
      const topMixes = await db.execute(sql`
        SELECT m.id, m.title, m.artist_id
        FROM mixes m
        WHERE m.created_at >= ${sevenDaysAgo}
        ORDER BY m.play_count DESC
        LIMIT 5
      `);

      await sendEmail({
        to: user.email,
        subject: "🔥 Your Weekly Hectic Digest",
        html: generateWeeklyDigestEmail(
          user.name || 'Listener',
          topMixes.rows
        ),
      });
      sent++;
    } catch (error) {
      console.error(`[Marketing] Failed to send weekly digest to ${user.email}:`, error);
    }
  }

  console.log(`[Marketing] Weekly digest sent to ${sent} users`);
  return { sent, total: activeUsers.rows.length };
}

/**
 * Send birthday/anniversary emails
 */
export async function sendBirthdayEmails() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const birthdayUsers = await db.execute(sql`
    SELECT id, email, name
    FROM users
    WHERE MONTH(birthday) = ${month}
    AND DAY(birthday) = ${day}
    AND email IS NOT NULL
  `);

  let sent = 0;
  for (const user of birthdayUsers.rows) {
    try {
      await sendEmail({
        to: user.email,
        subject: "🎉 Happy Birthday from Hectic Radio!",
        html: generateBirthdayEmail(user.name || 'there'),
      });
      sent++;
    } catch (error) {
      console.error(`[Marketing] Failed to send birthday email to ${user.email}:`, error);
    }
  }

  console.log(`[Marketing] Birthday emails sent to ${sent} users`);
  return sent;
}

/**
 * Trigger-based email: New mix from favorite artist
 */
export async function notifyNewMixFromArtist(mixId: number, artistId: number) {
  // Find users who have played this artist's mixes before
  const fans = await db.execute(sql`
    SELECT DISTINCT u.id, u.email, u.name
    FROM users u
    INNER JOIN mix_plays mp ON u.id = mp.user_id
    INNER JOIN mixes m ON mp.mix_id = m.id
    WHERE m.artist_id = ${artistId}
    AND u.email IS NOT NULL
    AND mp.played_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    GROUP BY u.id
    HAVING COUNT(*) >= 3
    LIMIT 1000
  `);

  const mix = await db.execute(sql`
    SELECT m.title, a.name as artist_name
    FROM mixes m
    LEFT JOIN artists a ON m.artist_id = a.id
    WHERE m.id = ${mixId}
  `);

  if (!mix.rows[0]) return;

  const mixData = mix.rows[0];
  let sent = 0;

  for (const fan of fans.rows) {
    try {
      await sendEmail({
        to: fan.email,
        subject: `🎵 New ${mixData.artist_name} Mix Just Dropped!`,
        html: generateNewMixEmail(
          fan.name || 'there',
          mixData.title,
          mixData.artist_name
        ),
      });
      sent++;
    } catch (error) {
      console.error(`[Marketing] Failed to send new mix notification to ${fan.email}:`, error);
    }
  }

  console.log(`[Marketing] New mix notification sent to ${sent} fans`);
  return sent;
}

/**
 * Drip campaign: Onboarding sequence
 */
export async function sendOnboardingSequence(userId: number, day: number) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (!user?.email) return;

  const sequences = {
    1: {
      subject: "Welcome to Hectic Radio! Let's get started 🎧",
      html: generateOnboardingDay1Email(user.name || 'there'),
    },
    3: {
      subject: "Discover your perfect mix",
      html: generateOnboardingDay3Email(user.name || 'there'),
    },
    7: {
      subject: "You're now part of the Hectic family!",
      html: generateOnboardingDay7Email(user.name || 'there'),
    },
  };

  const sequence = sequences[day as keyof typeof sequences];
  if (!sequence) return;

  await sendEmail({
    to: user.email,
    subject: sequence.subject,
    html: sequence.html,
  });

  console.log(`[Marketing] Onboarding day ${day} email sent to ${user.email}`);
}

/**
 * Segment users for targeted campaigns
 */
export async function segmentUsers(segment: 'active' | 'inactive' | 'new' | 'vip') {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let query;

  switch (segment) {
    case 'active':
      query = sql`
        SELECT DISTINCT u.id, u.email, u.name
        FROM users u
        INNER JOIN mix_plays mp ON u.id = mp.user_id
        WHERE mp.played_at >= ${sevenDaysAgo}
        AND u.email IS NOT NULL
      `;
      break;

    case 'inactive':
      query = sql`
        SELECT u.id, u.email, u.name
        FROM users u
        WHERE u.id NOT IN (
          SELECT DISTINCT user_id FROM mix_plays WHERE played_at >= ${thirtyDaysAgo}
        )
        AND u.email IS NOT NULL
      `;
      break;

    case 'new':
      query = sql`
        SELECT id, email, name
        FROM users
        WHERE created_at >= ${sevenDaysAgo}
        AND email IS NOT NULL
      `;
      break;

    case 'vip':
      query = sql`
        SELECT u.id, u.email, u.name
        FROM users u
        INNER JOIN mix_plays mp ON u.id = mp.user_id
        WHERE mp.played_at >= ${thirtyDaysAgo}
        GROUP BY u.id
        HAVING COUNT(*) >= 20
      `;
      break;
  }

  const result = await db.execute(query);
  return result.rows;
}

// ===== EMAIL TEMPLATES =====

function generateReEngagementEmail(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #FF0000;">We Miss You, ${name}! 🎧</h1>
      <p>It's been a while since you tuned in to Hectic Radio. We've got some fresh mixes waiting for you!</p>
      
      <h2>What You've Been Missing:</h2>
      <ul>
        <li>🔥 Brand new UK Garage anthems</li>
        <li>🎵 Exclusive DJ sets you won't find anywhere else</li>
        <li>💬 The community has been asking about you</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hecticradio.com" style="background: #FF0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          LISTEN NOW
        </a>
      </div>
      
      <p>See you on the dancefloor! 💃</p>
      <p><strong>DJ Danny Hectic B</strong></p>
    </body>
    </html>
  `;
}

function generateAbandonedCartEmail(name: string, productName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>Hey ${name}, you left something behind!</h1>
      <p>We noticed you were checking out <strong>${productName}</strong> but didn't complete your purchase.</p>
      
      <p>Good news - it's still available! 🎉</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hecticradio.com/products" style="background: #FF0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          COMPLETE YOUR ORDER
        </a>
      </div>
      
      <p>Questions? Hit reply and let us know!</p>
    </body>
    </html>
  `;
}

function generateWeeklyDigestEmail(name: string, mixes: any[]): string {
  const mixList = mixes.map(m => `<li>${m.title}</li>`).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #FF0000;">Your Weekly Hectic Digest 🔥</h1>
      <p>Hey ${name}! Here's what's been heating up this week:</p>
      
      <h2>Top Mixes This Week:</h2>
      <ul>${mixList}</ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hecticradio.com/mixes" style="background: #FF0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          EXPLORE ALL MIXES
        </a>
      </div>
      
      <p>Keep it hectic! 🎧</p>
    </body>
    </html>
  `;
}

function generateBirthdayEmail(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
      <h1 style="font-size: 3rem;">🎉🎂🎊</h1>
      <h1 style="color: #FF0000;">Happy Birthday, ${name}!</h1>
      <p style="font-size: 1.2rem;">The Hectic Radio family is celebrating YOU today!</p>
      
      <p>To make your day extra special, we've got a surprise waiting for you...</p>
      
      <div style="margin: 30px 0;">
        <a href="https://hecticradio.com/birthday-surprise" style="background: #FF0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1rem;">
          CLAIM YOUR BIRTHDAY GIFT 🎁
        </a>
      </div>
      
      <p>Have an absolutely hectic birthday! 🎧🔥</p>
      <p><strong>- Danny & The Hectic Crew</strong></p>
    </body>
    </html>
  `;
}

function generateNewMixEmail(name: string, mixTitle: string, artistName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #FF0000;">🎵 New Drop Alert!</h1>
      <p>Hey ${name}!</p>
      
      <p><strong>${artistName}</strong> just dropped a fresh mix and we knew you'd want to hear it first:</p>
      
      <h2 style="text-align: center; padding: 20px; background: #f5f5f5; border-radius: 10px;">
        "${mixTitle}"
      </h2>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hecticradio.com/mixes/latest" style="background: #FF0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          LISTEN NOW
        </a>
      </div>
      
      <p>Be one of the first to experience this banger! 🔥</p>
    </body>
    </html>
  `;
}

function generateOnboardingDay1Email(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #FF0000;">Welcome to Hectic Radio, ${name}! 🎧</h1>
      <p>You've just joined the UK's most hectic music community. Here's how to get started:</p>
      
      <h2>3 Things to Do Right Now:</h2>
      <ol style="font-size: 1.1rem; line-height: 1.8;">
        <li><strong>Browse our mixes</strong> - 100+ exclusive sets waiting for you</li>
        <li><strong>Send a shout out</strong> - Get featured on the live show!</li>
        <li><strong>Join the community</strong> - Connect with thousands of music lovers</li>
      </ol>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hecticradio.com/getting-started" style="background: #FF0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          GET STARTED
        </a>
      </div>
      
      <p>Let's make some noise! 🔊</p>
      <p><strong>DJ Danny</strong></p>
    </body>
    </html>
  `;
}

function generateOnboardingDay3Email(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>Finding Your Perfect Mix, ${name}</h1>
      <p>Now that you've explored a bit, let's personalize your experience!</p>
      
      <h2>Tell us what you love:</h2>
      <ul>
        <li>🎵 UK Garage</li>
        <li>🥁 Drum & Bass</li>
        <li>🎹 House</li>
        <li>🎸 Bassline</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hecticradio.com/preferences" style="background: #FF0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          SET YOUR PREFERENCES
        </a>
      </div>
      
      <p>The more we know, the better your recommendations! 🎯</p>
    </body>
    </html>
  `;
}

function generateOnboardingDay7Email(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #FF0000;">You're Part of the Family Now! 🎉</h1>
      <p>Hey ${name},</p>
      
      <p>It's been a week since you joined us, and we're stoked to have you here!</p>
      
      <h2>Your Hectic Stats:</h2>
      <ul>
        <li>✅ Joined the community</li>
        <li>🎵 Discovered amazing mixes</li>
        <li>💬 Connected with fellow music lovers</li>
      </ul>
      
      <p><strong>What's Next?</strong></p>
      <p>Take it to the next level with our Inner Circle membership - exclusive perks, early access, and more!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hecticradio.com/inner-circle" style="background: #FF0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          LEARN MORE
        </a>
      </div>
      
      <p>Thanks for being hectic! 🔥</p>
    </body>
    </html>
  `;
}
