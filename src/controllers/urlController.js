import urlModel from '../models/urlModel.js';

const BASE_URL = process.env.BASE_URL;

async function shortenUrl(req, res) {
  try {
    const { originalUrl, customAlias, userId, expiresAt } = req.body;
    if (!originalUrl || !/^https?:\/\/.+/i.test(originalUrl))
      return res.status(400).json({ error: 'Geçerli bir URL giriniz.' });
    // customAlias varsa, regex kontrolü (sadece harf, rakam, alt çizgi)
    if (customAlias && !/^[a-zA-Z0-9_-]{3,20}$/.test(customAlias))
      return res.status(400).json({ error: 'Alias yalnızca harf, rakam, _ ve - içerebilir (3-20 karakter).' });

    const url = await urlModel.createUrl({ originalUrl, customAlias, userId, expiresAt });
    res.json({
      shortUrl: `${BASE_URL}/${url.short_code}`,
      ...url,
    });
  } catch (err) {
    if (err.message === 'AliasAlreadyExists')
      return res.status(409).json({ error: 'Bu özel alias zaten mevcut.' });
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
}

async function redirect(req, res) {
  try {
    const { code } = req.params;
    const url = await urlModel.getUrlByShortCode(code);
    if (!url || !url.is_active)
      return res.status(404).json({ error: 'URL bulunamadı veya pasif.' });

    // Eğer son kullanım tarihi geçtiyse inaktif yap
    if (url.expires_at && new Date(url.expires_at) < new Date()) {
      await pool.query('UPDATE urls SET is_active = false WHERE short_code = $1', [code]);
      return res.status(410).json({ error: 'Bu kısa URL\'nin süresi dolmuş.' });
    }
    // Tıklama artırımı
    await urlModel.incrementClickCount(code);

    res.redirect(url.original_url);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
}

export default { shortenUrl, redirect };
