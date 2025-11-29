# Hectic Economy

## Overview

The Hectic Economy is a digital currency system that rewards fans for engagement and allows them to redeem rewards. It's built on **HecticCoins**, which fans earn through various activities and can spend on exclusive rewards.

## Core Components

### Wallets

Every user has a wallet that tracks:
- **Balance Coins**: Current available coins
- **Lifetime Coins Earned**: Total coins earned since account creation
- **Lifetime Coins Spent**: Total coins spent on redemptions

Wallets are automatically created when a user first earns or spends coins.

### Coin Transactions

Every coin movement is recorded as a transaction with:
- **Amount**: Positive for earnings, negative for spending
- **Type**: `earn`, `spend`, or `adjust` (admin)
- **Source**: Where the coins came from (mission, shout, referral, etc.)
- **Reference ID**: Links to the source entity (mission ID, event ID, etc.)
- **Description**: Human-readable description

### Rewards

Rewards are items/services fans can redeem with HecticCoins:

**Types:**
- `digital` - Digital products (downloads, access codes)
- `physical` - Physical merchandise
- `access` - Access to events, backstage, VIP areas
- `aiAsset` - AI-generated content (scripts, voice, video)
- `other` - Miscellaneous rewards

**Fulfillment Types:**
- `manual` - Admin manually fulfills
- `autoEmail` - Automatic email sent
- `autoLink` - Automatic link/code provided
- `aiScript` - AI script generated
- `aiVoice` - AI voice generated
- `aiVideo` - AI video generated

### Redemptions

When a fan redeems a reward:
1. System checks wallet balance
2. Deducts coins from wallet
3. Creates redemption record with `status="pending"` (or `fulfilled` for auto-fulfillment)
4. Admin can approve/reject/fulfill via `/admin/redemptions`

### Referrals

Fans can create referral codes to invite others:
- Each code has optional `maxUses` and `expiresAt`
- When someone uses a code:
  - Both referrer and referred user get coins
  - Default: 100 coins each (configurable)
- Tracked in `referralUses` table

## Earning Coins

Coins are awarded automatically for:

1. **Missions** - Complete missions from the missions system
2. **Shouts** - Submit shouts (configurable amount)
3. **Track Votes** - Vote on track requests
4. **Login Streaks** - Daily login bonuses
5. **Event Attendance** - Attend live events
6. **Referrals** - Refer new users
7. **Admin Adjustments** - Manual adjustments by admins

### Integration Points

To award coins from existing features, call:

```typescript
await adjustCoins({
  userId: user.id,
  amount: 50, // Positive for earning
  type: "earn",
  source: "shout", // or "mission", "trackVote", etc.
  referenceId: shoutId, // Optional: link to source
  description: "Shout submitted",
});
```

## Spending Coins

Coins are spent when:
- Redeeming rewards (automatic deduction)
- Admin adjustments (manual)

The system prevents negative balances when spending.

## Admin Controls

### `/admin/economy`
- Overview dashboard
- Total coins in circulation
- Top earners
- Coins by source breakdown
- Redemption stats

### `/admin/rewards`
- CRUD for reward catalogue
- Set cost, type, fulfillment method
- Toggle active/inactive

### `/admin/redemptions`
- View all redemptions
- Filter by status
- Approve/reject/fulfill
- Add admin notes

### `/admin/referrals`
- View all referral codes
- See usage stats
- Monitor referral performance

## Fan Pages

### `/wallet`
- View current balance
- Lifetime earned/spent stats
- Recent transactions
- Link to rewards

### `/rewards`
- Browse active rewards
- See coin cost
- Redeem rewards (if logged in)
- View redemption status

## Database Schema

### `wallets`
- `id`, `userId`, `balanceCoins`, `lifetimeCoinsEarned`, `lifetimeCoinsSpent`

### `coinTransactions`
- `id`, `userId`, `walletId`, `amount`, `type`, `source`, `referenceId`, `description`

### `rewards`
- `id`, `name`, `description`, `costCoins`, `type`, `fulfillmentType`, `fulfillmentPayload`, `isActive`

### `redemptions`
- `id`, `userId`, `rewardId`, `status`, `coinsSpent`, `notesAdmin`

### `referralCodes`
- `id`, `code`, `ownerUserId`, `maxUses`, `expiresAt`

### `referralUses`
- `id`, `codeId`, `referredUserId`, `rewardCoins`

## Best Practices

1. **Award coins immediately** when actions complete (shout submitted, mission done)
2. **Use descriptive transaction descriptions** for clarity
3. **Set reasonable reward costs** based on earning rates
4. **Monitor redemption fulfillment** to keep fans happy
5. **Use referral codes** to incentivize growth
6. **Track coins by source** to understand what drives engagement

## Future Enhancements

- Coin transfers between users
- Coin expiration dates
- Tiered reward pricing
- Subscription-based coin allowances
- Coin marketplace (user-to-user trading)

