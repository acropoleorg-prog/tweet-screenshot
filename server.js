const express = require('express');
const path = require('path');
const { parseEmbed } = require('./src/parser');
const { screenshot } = require('./src/screenshotter');
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.post('/screenshot', async (req, res) => {
  const { embed } = req.body;
  if (!embed) return res.status(400).json({ error: 'Missing embed.' });
  try {
    const data = parseEmbed(embed);
    const img = await screenshot(data);
    res.set('Content-Type', 'image/png');
    res.send(img);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server on ' + PORT));
