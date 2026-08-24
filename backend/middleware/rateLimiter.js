// backend/middleware/rateLimiter.js
// Rate limiting to prevent abuse

const rateLimit = {};

/**
 * Simple in-memory rate limiter
 * For production, use Redis or a proper rate limiting library
 */
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimit[identifier]) {
      rateLimit[identifier] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    const userLimit = rateLimit[identifier];

    // Reset if window expired
    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
      return next();
    }

    // Check if limit exceeded
    if (userLimit.count >= maxRequests) {
      const remainingTime = Math.ceil((userLimit.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: remainingTime
      });
    }

    userLimit.count++;
    next();
  };
};

/**
 * Strict rate limiter for authentication endpoints
 */
const authRateLimiter = rateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes

/**
 * Standard rate limiter for general API endpoints
 */
const apiRateLimiter = rateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes

module.exports = {
  authRateLimiter,
  apiRateLimiter,
  rateLimiter
};
