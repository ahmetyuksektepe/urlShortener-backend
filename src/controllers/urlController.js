import urlModel from '../models/urlModel.js';
import pool from '../config/database.js';

const BASE_URL = process.env.BASE_URL;

async function shortenUrl(req, res) {
  try {
    console.log(' Shorten URL request:', req.body);
    
    const { originalUrl, customAlias, userId, expiresAt } = req.body;
    if (!originalUrl || !/^https?:\/\/.+/i.test(originalUrl))
      return res.status(400).json({ error: 'Geçerli bir URL giriniz.' });
    
    // customAlias varsa, regex kontrolü (sadece harf, rakam, alt çizgi)
    if (customAlias && !/^[a-zA-Z0-9_-]{3,20}$/.test(customAlias))
      return res.status(400).json({ error: 'Alias yalnızca harf, rakam, _ ve - içerebilir (3-20 karakter).' });

    // Expire date belirtilmemişse 1 hafta sonrası otomatik ekle
    let finalExpiresAt = expiresAt;
    if (!finalExpiresAt) {
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      finalExpiresAt = oneWeekFromNow.toISOString();
    }

    const url = await urlModel.createUrl({ originalUrl, customAlias, userId, expiresAt: finalExpiresAt });
    
    const response = {
      shortUrl: `${BASE_URL}/${url.short_code}`,
      ...url,
    };

    console.log('URL created successfully:', response);
    res.json(response);
  } catch (err) {
    console.error('Shorten URL error:', err);
    if (err.message === 'AliasAlreadyExists')
      return res.status(409).json({ error: 'Bu özel alias zaten mevcut.' });
    res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
  }
}

async function redirect(req, res) {
  try {
    const { code } = req.params;
    console.log('Redirect request for code:', code);
    
    const url = await urlModel.getUrlByShortCode(code);
    if (!url || !url.is_active) {
      console.log('URL not found or inactive:', code);
      return res.status(404).json({ error: 'URL bulunamadı veya pasif.' });
    }

    // Eğer son kullanım tarihi geçtiyse inaktif yap
    if (url.expires_at && new Date(url.expires_at) < new Date()) {
      await pool.query('UPDATE urls SET is_active = false WHERE short_code = $1', [code]);
      console.log('URL expired:', code);
      return res.status(410).json({ error: 'Bu kısa URL\'nin süresi dolmuş.' });
    }
    
    // Tıklama artırımı
    await urlModel.incrementClickCount(code);
    console.log('Redirecting to:', url.original_url);
    
    res.redirect(url.original_url);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
  }
}

async function getStats(req, res) {
  try {
    const { code } = req.params;
    console.log('Stats request for code:', code);
    
    const result = await pool.query('SELECT * FROM urls WHERE short_code = $1', [code]);
    
    if (result.rows.length === 0) {
      console.log('URL not found for stats:', code);
      return res.status(404).json({ error: 'URL bulunamadı' });
    }
    
    const url = result.rows[0];
    const response = {
      shortCode: url.short_code,
      originalUrl: url.original_url,
      clickCount: url.click_count,
      isActive: url.is_active,
      createdAt: url.created_at,
      expiresAt: url.expires_at
    };
    
    console.log('Stats retrieved:', response);
    res.json(response);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
  }
}

export default { shortenUrl, redirect, getStats };
