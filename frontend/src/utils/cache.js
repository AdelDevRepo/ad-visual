const CACHE_KEY = 'ai_image_gallery_cache';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

export const getFromCache = (key) => {
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_EXPIRATION) {
      return data[key];
    }
  }
  return null;
};

export const setInCache = (key, value) => {
  const cachedData = localStorage.getItem(CACHE_KEY);
  let data = {};
  if (cachedData) {
    data = JSON.parse(cachedData).data;
  }
  data[key] = value;
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};