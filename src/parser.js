const cheerio = require('cheerio');

/**
 * Parses a Twitter embed blockquote HTML and extracts tweet data.
 * @param {string} embedHtml - Raw embed HTML from Twitter "Copy embed" feature
 * @returns {object} Parsed tweet data
 */
function parseEmbed(embedHtml) {
  const $ = cheerio.load(embedHtml);
  const blockquote = $('blockquote.twitter-tweet');

  if (!blockquote.length) {
    throw new Error('Invalid embed: no blockquote.twitter-tweet found.');
  }

  // --- Text ---
  // The tweet text is inside the <p> tag. We grab inner HTML to preserve emojis and links.
  const pTag = blockquote.find('p').first();
  
  // Remove pic.twitter.com links from text (media links, not readable)
  pTag.find('a[href*="pic.twitter.com"], a[href*="t.co"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text() || '';
    // Keep non-media links as readable text
    if (text.startsWith('pic.twitter.com') || text.startsWith('https://t.co')) {
      $(el).remove();
    }
  });

  const tweetText = pTag.text().trim();

  // --- Author ---
  // Format: — Name (@handle) <a>date</a>
  // The last <a> before the closing is the date link, the text before is "— Name (@Handle)"
  const links = blockquote.find('a');
  const lastLink = links.last();
  
  // Date
  const dateText = lastLink.text().trim(); // e.g. "June 8, 2023"
  const tweetUrl = lastLink.attr('href') || '';

  // Author line: everything between the <p> and the last <a>
  // cheerio gives us the raw text, we parse "— Name (@handle)"
  const blockquoteText = blockquote.text();
  const afterP = blockquoteText.split(pTag.text()).pop() || '';
  
  // Try to extract name and handle from "— Name (@handle)" pattern
  const authorMatch = afterP.match(/—\s*(.+?)\s*\(@([^)]+)\)/);
  let authorName = 'Unknown';
  let authorHandle = 'unknown';

  if (authorMatch) {
    authorName = authorMatch[1].trim();
    authorHandle = authorMatch[2].trim();
  } else {
    // Fallback: try mdash variants
    const mdashMatch = afterP.match(/[\u2014\u2013]\s*(.+?)\s*\(@([^)]+)\)/);
    if (mdashMatch) {
      authorName = mdashMatch[1].trim();
      authorHandle = mdashMatch[2].trim();
    }
  }

  // --- Tweet ID (for potential future use) ---
  const tweetIdMatch = tweetUrl.match(/status\/(\d+)/);
  const tweetId = tweetIdMatch ? tweetIdMatch[1] : null;

  // --- Avatar initial (fallback when no avatar image) ---
  const avatarInitial = authorName.charAt(0).toUpperCase();

  return {
    tweetText,
    authorName,
    authorHandle,
    avatarInitial,
    avatarUrl: null,        // oEmbed doesn't give avatar; future enhancement
    mediaUrl: null,         // inline media not available from embed HTML
    tweetDate: dateText,
    tweetUrl,
    tweetId,
    verified: false,        // can't determine from embed HTML alone
    replyCount: '',
    retweetCount: '',
    likeCount: '',
  };
}

module.exports = { parseEmbed };
