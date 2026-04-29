const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '../templates/tweet.html');

/**
 * Simple template engine - replaces {{key}} and {{#if key}}...{{/if}} blocks.
 */
function renderTemplate(template, data) {
  let html = template;

  // Handle {{#if key}}...{{/if}} blocks
  html = html.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, inner) => {
    return data[key] ? inner : '';
  });

  // Replace {{key}} variables
  html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] !== undefined && data[key] !== null ? String(data[key]) : '';
  });

  return html;
}

/**
 * Takes a screenshot of a rendered tweet card.
 * @param {object} tweetData - Parsed tweet data object
 * @returns {Buffer} PNG image buffer
 */
async function screenshot(tweetData) {
  const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const renderedHtml = renderTemplate(templateHtml, tweetData);

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 640, height: 800 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Set viewport wide enough for the card
    await page.setViewport({ width: 640, height: 800, deviceScaleFactor: 2 });

    await page.setContent(renderedHtml, { waitUntil: 'networkidle0' });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    // Get the exact bounding box of the tweet card
    const element = await page.$('#tweet');
    if (!element) throw new Error('Tweet card element not found in template.');

    const imageBuffer = await element.screenshot({
      type: 'png',
      omitBackground: false,
    });

    return imageBuffer;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { screenshot };
