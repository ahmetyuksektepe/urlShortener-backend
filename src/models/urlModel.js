import pool from '../config/database.js';
import shortCodeGenerator from '../utils/shortCodeGenerator.js';

// Yeni URL ekleme
async function createUrl({ originalUrl, customAlias, userId, expiresAt }) {
  let short_code;
  let url;

  if (customAlias) {
    // CustomAlias varsa önce kontrol et 
    const existShort = await pool.query('SELECT * FROM urls WHERE short_code = $1', [customAlias]);
    const existCustom = await pool.query('SELECT * FROM urls WHERE custom_alias = $1', [customAlias]);
    
    if (existShort.rows.length > 0 || existCustom.rows.length > 0) {
      throw new Error('AliasAlreadyExists');
    }
    
    // CustomAlias ile kaydet
    const result = await pool.query(
      'INSERT INTO urls (original_url, short_code, custom_alias, user_id, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [originalUrl, customAlias, customAlias, userId, expiresAt]
    );
    url = result.rows[0];
  } else {
    // Önce geçici bir short_code ile kaydet idye göre 
    const tempCode = 'temp_' + Date.now();
    const result = await pool.query(
      'INSERT INTO urls (original_url, short_code, user_id, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [originalUrl, tempCode, userId, expiresAt]
    );
    
    // ID'ye göre gerçek short_code oluştur
    short_code = shortCodeGenerator.encode(result.rows[0].id);

    // short_code'u gerçek değerle güncelle
    const updateResult = await pool.query(
      'UPDATE urls SET short_code = $1 WHERE id = $2 RETURNING *', 
      [short_code, result.rows[0].id]
    );
    url = updateResult.rows[0];
  }

  return url;
}

async function getUrlByShortCode(short_code) {
  const result = await pool.query('SELECT * FROM urls WHERE short_code = $1', [short_code]);
  return result.rows[0];
}

async function incrementClickCount(short_code) {
  await pool.query('UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1', [short_code]);
}

export default { createUrl, getUrlByShortCode, incrementClickCount };
