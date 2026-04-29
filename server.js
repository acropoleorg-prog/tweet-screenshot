const express = require('express');
const { parseEmbed } = require('./src/parser');
const { screenshot } = require('./src/screenshotter');

const app = express();
app.use(express.json({ limit: '1mb' }));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'tweet-screenshot',
    usage: 'POST /screenshot with { "embed": "<blockquote class=\\"twitter-tweet\\">...</blockquote>" }',
  });
});

// ─── Main endpoint ────────────────────────────────────────────────────────────
/**
 * POST /screenshot
 * Body: { "embed": "<blockquote class=\"twitter-tweet\">...</blockquote> <script>...</script>" }
 * Returns: PNG image
 */
app.post('/screenshot', async (req, res) => {
  const { embed } = req.body;

  if (!embed || typeof embed !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid "embed" field. Send the raw HTML from Twitter "Copy embed".',
    });
  }

  let tweetData;
  try {
    tweetData = parseEmbed(embed);
  } catch (err) {
    return res.status(422).json({
      error: 'Could not parse embed HTML.',
      detail: err.message,
    });
  }

  let imageBuffer;
  try {
    imageBuffer = await screenshot(tweetData);
  } catch (err) {
    console.error('Screenshot error:', err);
    return res.status(500).json({
      error: 'Failed to generate screenshot.',
      detail: err.message,
    });
  }

  res.set('Content-Type', 'image/png');
  res.set('Content-Disposition', `inline; filename="tweet-${tweetData.tweetId || 'screenshot'}.png"`);
  res.send(imageBuffer);
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ tweet-screenshot running on port ${PORT}`);
});
