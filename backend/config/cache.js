const Redis = require('ioredis');

let client = null;
let isConnected = false;

const getClient = () => {
  if (!client && process.env.REDIS_URL) {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    client.on('connect', () => { isConnected = true; });
    client.on('error', () => { isConnected = false; });

    client.connect().catch(() => { isConnected = false; });
  }
  return client;
};

const cache = {
  async get(key) {
    try {
      const c = getClient();
      if (!c || !isConnected) return null;
      const data = await c.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async set(key, value, ttlSeconds = 300) {
    try {
      const c = getClient();
      if (!c || !isConnected) return;
      await c.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // Cache write failure is non-fatal
    }
  },

  async del(...keys) {
    try {
      const c = getClient();
      if (!c || !isConnected) return;
      await c.del(...keys);
    } catch {
      // Cache delete failure is non-fatal
    }
  },

  async delPattern(pattern) {
    try {
      const c = getClient();
      if (!c || !isConnected) return;
      const keys = await c.keys(pattern);
      if (keys.length) await c.del(...keys);
    } catch {
      // Non-fatal
    }
  },
};

module.exports = cache;
