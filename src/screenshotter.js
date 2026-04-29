const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const TEMPLATE_PATH = path.join(__dirname, '../templates/tweet.html');
function renderTemplate(template, data) {
  let html = template;
  html = html.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, inner) => data[key] ? inner : '');
  html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] !== undefined && data[key] !== null ? String(data[key]) : '');
  return html;
}
async function screenshot(tweetData) {
  const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const renderedHtml = renderTemplate(templateHtml, tweetData);
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 800, deviceScaleFactor: 2 });
    await page.setContent(renderedHtml, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    const element = await page.$('#tweet');
    if (!element) throw new Error('Tweet card element not found.');
    return await element.screenshot({ type: 'png' });
  } finally { if (browser) await browser.close(); }
}
module.exports = { screenshot };
