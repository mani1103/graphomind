const https = require('https');

function buildPrompt(name) {
  const who = name ? `The handwriting belongs to ${name}. Address them by name in the summary, fun_fact and advice fields.` : '';
  return `You are GraphoMind, a world-class expert graphologist with 20+ years experience. ${who} Analyse the handwriting image in rich detail — examine letter size, slant, pressure, spacing, loops, baseline, and pen lifts. Return ONLY a raw JSON object, no markdown, no backticks, first character must be {. Use this exact structure:
{"archetype":"The [vivid 2-3 word archetype]","summary":"4 sentence rich personality overview","energy_score":72,"creativity_score":68,"social_score":55,"traits":{"personality":[{"name":"Confidence","score":70,"note":"specific observation"},{"name":"Creativity","score":65,"note":"specific observation"},{"name":"Empathy","score":80,"note":"specific observation"},{"name":"Ambition","score":75,"note":"specific observation"},{"name":"Introversion","score":45,"note":"specific observation"}],"thinking":[{"name":"Analytical","score":60,"note":"specific observation"},{"name":"Intuitive","score":78,"note":"specific observation"},{"name":"Detail Focus","score":55,"note":"specific observation"},{"name":"Big Picture","score":82,"note":"specific observation"}],"social":[{"name":"Openness","score":70,"note":"specific observation"},{"name":"Trustworthiness","score":85,"note":"specific observation"},{"name":"Expressiveness","score":60,"note":"specific observation"}]},"handwriting_markers":["feature 1","feature 2","feature 3","feature 4"],"strengths":["s1","s2","s3","s4"],"growth_areas":["g1","g2"],"career_hints":["c1","c2","c3"],"relationship_style":"2-3 sentences","fun_fact":"quirky insight","advice":"warm encouraging sentence"}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, mimeType, name } = req.body;
  if (!image || !mimeType) return res.status(400).json({ error: 'Missing image or mimeType' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured on server' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1500,
        system: buildPrompt(name),
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
            { type: 'text', text: 'Analyse this handwriting sample thoroughly and return only the JSON report.' },
          ],
        }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || `API error ${response.status}` });
    }

    const raw = data.content?.find(b => b.type === 'text')?.text || '';
    const report = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return res.status(200).json({ report });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
