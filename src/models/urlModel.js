import pool from '../config/database.js';

// Yeni URL ekleme
async function createUrl({ originalUrl, customAlias, userId, expiresAt }) {
  // Önce customAlias varsa, ona göre kaydet
  let short_code;
  if (customAlias) {
    // Eğer aynı customAlias zaten varsa hata fırlat
    const exist = await pool.query('SELECT * FROM urls WHERE short_code = $1', [customAlias]);
    if (exist.rows.length > 0) throw new Error('AliasAlreadyExists');
    short_code = customAlias;
  } else {
    // id numarasını alıp base62'ye çeviriyoruz
    const result = await pool.query(
      'INSERT INTO urls (original_url, user_id, expires_at) VALUES ($1, $2, $3) RETURNING id',
      [originalUrl, userId, expiresAt]
    );
    const { encode } = await import('../utils/shortCodeGenerator.js');
    short_code = encode(result.rows[0].id);

    // short_code'u update et (id'ye bağlı olarak base62 kodunu kullanıyoruz)
    await pool.query('UPDATE urls SET short_code = $1 WHERE id = $2', [short_code, result.rows[0].id]);
  }

  // Tüm kayıtları döndür short code ile eşleşen
  const url = await pool.query('SELECT * FROM urls WHERE short_code = $1', [short_code]);
  return url.rows[0];
}

async function getUrlByShortCode(short_code) {
  const result = await pool.query('SELECT * FROM urls WHERE short_code = $1', [short_code]);
  return result.rows[0];
}

async function incrementClickCount(short_code) {
  await pool.query('UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1', [short_code]);
}

export default { createUrl, getUrlByShortCode, incrementClickCount };
