interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export function rateLimit(identifier: string, limit: number = 5, windowMs: number = 60000) {
  const now = Date.now();
  const key = `rate-limit:${identifier}`;

  if (!store[key]) {
    store[key] = { count: 1, resetTime: now + windowMs };
    return { success: true, remaining: limit - 1 };
  }

  const record = store[key];

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { success: true, remaining: limit - 1 };
  }

  record.count += 1;

  if (record.count > limit) {
    return { 
      success: false, 
      error: 'Too many requests. Please try again later.',
      remaining: 0,
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    };
  }

  return { success: true, remaining: limit - record.count };
}

export function clearRateLimit(identifier: string) {
  const key = `rate-limit:${identifier}`;
  delete store[key];
}
