const redis = require('../lib/redisClient');

const GOOGLE_FONTS_API = 'https://www.googleapis.com/webfonts/v1/webfonts';
const CACHE_KEY_ALL = 'fonts:all';
const CACHE_KEY_POPULAR = 'fonts:popular';
const CACHE_TTL = 60 * 60 * 24; // 24 hours
const POPULAR_COUNT = 100;

const fetchFromGoogle = async () => {
  const apiKey = process.env.GOOGLE_FONTS_API_KEY;
  if (!apiKey) {
    const err = new Error('GOOGLE_FONTS_API_KEY is not configured');
    err.status = 503;
    throw err;
  }

  const url = `${GOOGLE_FONTS_API}?key=${apiKey}&sort=popularity`;
  const res = await fetch(url);

  if (!res.ok) {
    const err = new Error(`Google Fonts API responded with ${res.status}`);
    err.status = 502;
    throw err;
  }

  const data = await res.json();
  return data.items.map(font => ({
    family: font.family,
    variants: font.variants,
  }));
};

const getFonts = async (req, res, next) => {
  try {
    // Try cache first
    const [cachedAll, cachedPopular] = await Promise.all([
      redis.get(CACHE_KEY_ALL),
      redis.get(CACHE_KEY_POPULAR),
    ]);

    if (cachedAll && cachedPopular) {
      return res.json({
        popular: JSON.parse(cachedPopular),
        all: JSON.parse(cachedAll),
      });
    }

    // Cache miss — fetch from Google
    const allFonts = await fetchFromGoogle();
    const popularFonts = allFonts.slice(0, POPULAR_COUNT);

    // Cache results
    await Promise.all([
      redis.set(CACHE_KEY_ALL, JSON.stringify(allFonts), 'EX', CACHE_TTL),
      redis.set(CACHE_KEY_POPULAR, JSON.stringify(popularFonts), 'EX', CACHE_TTL),
    ]);

    res.json({ popular: popularFonts, all: allFonts });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFonts };
