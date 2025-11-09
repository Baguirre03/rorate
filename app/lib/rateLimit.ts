import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to a default if no IP header is found
  // In production, this shouldn't happen, but we need a fallback
  return "unknown";
}

export interface RateLimitOptions {
  maxRequests: number; // Maximum number of requests
  windowMs: number; // Time window in milliseconds
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  maxRequests: 10, // 10 requests
  windowMs: 60 * 1000, // per minute
};

export interface RateLimitResult {
  allowed: boolean;
  response?: NextResponse;
  remaining?: number;
  resetTime?: number;
  limit?: number;
}

/**
 * Rate limit middleware
 * Returns result object with allowed status and optional response/headers
 */
export function rateLimit(
  request: NextRequest,
  options: RateLimitOptions = DEFAULT_OPTIONS
): RateLimitResult {
  const ip = getClientIP(request);
  const now = Date.now();
  const { maxRequests, windowMs } = options;

  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetTime < now) {
    // No entry or expired, create new one
    const newResetTime = now + windowMs;
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: newResetTime,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newResetTime,
      limit: maxRequests,
    };
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: "Too many requests",
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
          },
        }
      ),
      remaining: 0,
      resetTime: entry.resetTime,
      limit: maxRequests,
    };
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(ip, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
    limit: maxRequests,
  };
}
