export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, system } = req.body;

    // Build messages array — prepend system as a system message if provided
    const allMessages = system
      ? [{ role: 'system', content: system }, ...messages]
      : messages;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        max_tokens: 1000,
        messages: allMessages,
      }),
    });

    const data = await response.json();

    // Reformat Grok's response to match the Anthropic shape the HTML expects
    // Grok returns: data.choices[0].message.content
    // HTML expects: data.content[0].text
    const text = data?.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content: [{ type: 'text', text }] });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
