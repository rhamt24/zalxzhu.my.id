// Proxy status gist -> hanya mengembalikan isi status.json (token GitHub tetap rahasia, tidak ada header "undefined").
export default async function handler(req, res) {
  const { id } = req.query;
  if (!/^[0-9a-f]{20,40}$/i.test(id || '')) return res.status(400).json({ error: 'Gist ID tidak valid' });
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'zalxzhu-status' };
  if (process.env.GH_TOKEN) headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;
  try {
    const r = await fetch(`https://api.github.com/gists/${id}`, { headers });
    if (!r.ok) return res.status(r.status).json({ error: 'Gist gagal diambil' });
    const file = (await r.json()).files?.['status.json'];
    if (!file) return res.status(404).json({ error: 'status.json tidak ada' });
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(JSON.parse(file.content));
  } catch (e) { return res.status(500).json({ error: e.message }); }
}
