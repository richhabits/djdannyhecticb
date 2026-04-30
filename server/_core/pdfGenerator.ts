/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { RATE_CARD, RateCategory } from "./rateCardContent";

/**
 * Simple PDF generator using minimal HTML structure converted to PDF format
 * This creates a downloadable rate card in PDF format
 */

interface PDFOptions {
  title?: string;
  author?: string;
}

/**
 * Generates an HTML representation that can be converted to PDF
 * Returns HTML string suitable for conversion to PDF
 */
export function generateRateCardHTML(): string {
  const { header, categories, whatsIncluded, notIncluded, terms, contact } = RATE_CARD;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${header.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
      background: #fff;
      padding: 40px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #ff1744;
      padding-bottom: 30px;
    }

    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .header p.subtitle {
      font-size: 16px;
      color: #666;
      margin-bottom: 10px;
    }

    .header p.tagline {
      font-size: 14px;
      color: #ff1744;
      font-style: italic;
      font-weight: 500;
    }

    .category {
      margin-bottom: 35px;
      page-break-inside: avoid;
    }

    .category h2 {
      font-size: 22px;
      margin-bottom: 10px;
      color: #1a1a1a;
      border-left: 4px solid #ff1744;
      padding-left: 15px;
    }

    .category-desc {
      font-size: 13px;
      color: #666;
      margin-bottom: 20px;
      padding-left: 15px;
    }

    .tier {
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 18px;
      margin-bottom: 15px;
      page-break-inside: avoid;
    }

    .tier h3 {
      font-size: 16px;
      margin-bottom: 8px;
      color: #1a1a1a;
    }

    .tier-price {
      font-size: 18px;
      font-weight: 700;
      color: #ff1744;
      margin-bottom: 8px;
    }

    .tier-notes {
      font-size: 12px;
      color: #888;
      font-style: italic;
      margin-bottom: 12px;
    }

    .tier-includes {
      font-size: 12px;
    }

    .tier-includes strong {
      display: block;
      margin-top: 10px;
      margin-bottom: 6px;
    }

    .tier-includes ul {
      list-style: none;
      padding-left: 0;
    }

    .tier-includes li {
      padding-left: 20px;
      position: relative;
      margin-bottom: 4px;
      font-size: 11px;
    }

    .tier-includes li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #ff1744;
      font-weight: bold;
    }

    .section {
      margin-top: 35px;
      page-break-inside: avoid;
    }

    .section h2 {
      font-size: 22px;
      margin-bottom: 15px;
      color: #1a1a1a;
      border-left: 4px solid #ff1744;
      padding-left: 15px;
    }

    .section-list {
      list-style: none;
      padding-left: 15px;
    }

    .section-list li {
      margin-bottom: 10px;
      padding-left: 20px;
      position: relative;
      font-size: 13px;
    }

    .section-list li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #ff1744;
      font-weight: bold;
    }

    .terms-section {
      background: #f9f9f9;
      border-left: 4px solid #ff1744;
      padding: 15px;
      margin-bottom: 15px;
      font-size: 12px;
    }

    .terms-section h3 {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .contact-section {
      background: #f0f0f0;
      border-radius: 8px;
      padding: 25px;
      text-align: center;
      margin-top: 35px;
      page-break-inside: avoid;
    }

    .contact-section h2 {
      border: none;
      padding: 0;
      margin-bottom: 10px;
      font-size: 24px;
    }

    .contact-subtitle {
      font-size: 14px;
      color: #666;
      margin-bottom: 15px;
    }

    .contact-details {
      font-size: 13px;
      margin-bottom: 10px;
    }

    .contact-details p {
      margin-bottom: 6px;
    }

    .contact-cta {
      font-size: 14px;
      color: #ff1744;
      font-weight: 600;
      margin-top: 15px;
    }

    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 11px;
      color: #999;
    }

    @media print {
      body {
        padding: 20px;
      }

      .tier, .terms-section, .contact-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${header.title}</h1>
      <p class="subtitle">${header.subtitle}</p>
      <p class="tagline">${header.tagline}</p>
    </div>

    <!-- Categories & Pricing -->
    ${categories
      .map(
        (category) => `
      <div class="category">
        <h2>${category.name}</h2>
        <p class="category-desc">${category.description}</p>
        ${category.tiers
          .map(
            (tier) => `
          <div class="tier">
            <h3>${tier.name}</h3>
            <div class="tier-price">${tier.priceRange}</div>
            ${tier.notes ? `<div class="tier-notes">${tier.notes}</div>` : ""}
            <div class="tier-includes">
              <strong>Included:</strong>
              <ul>
                ${tier.included.map((item) => `<li>${item}</li>`).join("")}
              </ul>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `
      )
      .join("")}

    <!-- What's Included -->
    <div class="section">
      <h2>${whatsIncluded.title}</h2>
      <ul class="section-list">
        ${whatsIncluded.items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>

    <!-- Additional Charges -->
    <div class="section">
      <h2>${notIncluded.title}</h2>
      <ul class="section-list">
        ${notIncluded.items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>

    <!-- Terms -->
    <div class="section">
      <h2>${terms.title}</h2>
      ${terms.sections
        .map(
          (section) => `
        <div class="terms-section">
          <h3>${section.heading}</h3>
          <p>${section.content.split("\n").join("<br>")}</p>
        </div>
      `
        )
        .join("")}
    </div>

    <!-- Contact -->
    <div class="contact-section">
      <h2>${contact.title}</h2>
      <p class="contact-subtitle">${contact.subtitle}</p>
      <div class="contact-details">
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Instagram:</strong> ${contact.instagram}</p>
        <p><strong>Website:</strong> ${contact.website}</p>
      </div>
      <p class="contact-cta">${contact.cta}</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>${RATE_CARD.footer.disclaimer}</p>
      <p>Last Updated: ${RATE_CARD.footer.lastUpdated}</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return html;
}

/**
 * Generates a simple PDF-compatible format
 * In production, you'd use a library like pdfkit or puppeteer
 * For now, this returns HTML that can be printed to PDF
 *
 * @returns HTML string ready for PDF conversion
 */
export function generateRateCardPDF(): string {
  return generateRateCardHTML();
}

/**
 * For server-side PDF generation, you can use this helper
 * This would need pdfkit or similar library installed:
 * npm install pdfkit
 *
 * Example implementation:
 * ```
 * import PDFDocument from 'pdfkit';
 *
 * export async function generateRateCardPDFBuffer(): Promise<Buffer> {
 *   const doc = new PDFDocument();
 *   const chunks: Buffer[] = [];
 *
 *   doc.on('data', (chunk) => chunks.push(chunk));
 *
 *   // Add content to doc...
 *   // doc.fontSize(25).text(RATE_CARD.header.title, 100, 100);
 *   // etc...
 *
 *   doc.end();
 *
 *   return new Promise((resolve, reject) => {
 *     doc.on('end', () => resolve(Buffer.concat(chunks)));
 *     doc.on('error', reject);
 *   });
 * }
 * ```
 */
