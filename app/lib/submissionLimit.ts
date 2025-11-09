import { NextRequest, NextResponse } from "next/server";

interface SubmissionCountEntry {
  count: number;
  createdAt: number;
}

// Track submission counts per IP
// Note: In serverless environments, this only works per-instance
// For production, consider using Redis/KV store for distributed tracking
const submissionCountStore = new Map<string, SubmissionCountEntry>();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  for (const [ip, entry] of submissionCountStore.entries()) {
    // Remove entries older than 1 hour
    if (now - entry.createdAt > ONE_HOUR) {
      submissionCountStore.delete(ip);
    }
  }
}, 60 * 60 * 1000);

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "unknown";
}

/**
 * Check if IP can create a new submission (max 10 submissions per IP)
 */
export function checkSubmissionLimit(
  request: NextRequest,
  maxSubmissions: number = 10
): {
  allowed: boolean;
  response?: NextResponse;
  currentCount?: number;
  remaining?: number;
} {
  const ip = getClientIP(request);
  const entry = submissionCountStore.get(ip);

  if (!entry) {
    // First submission from this IP
    return {
      allowed: true,
      currentCount: 0,
      remaining: maxSubmissions,
    };
  }

  if (entry.count >= maxSubmissions) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: "Submission limit exceeded",
          message: `You have reached the maximum limit of ${maxSubmissions} submissions. Please wait before submitting more.`,
          currentCount: entry.count,
          limit: maxSubmissions,
        },
        {
          status: 429,
          headers: {
            "X-Submission-Limit": maxSubmissions.toString(),
            "X-Submission-Count": entry.count.toString(),
            "X-Submission-Remaining": "0",
          },
        }
      ),
      currentCount: entry.count,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    currentCount: entry.count,
    remaining: maxSubmissions - entry.count,
  };
}

/**
 * Increment submission count for an IP
 */
export function incrementSubmissionCount(request: NextRequest): void {
  const ip = getClientIP(request);
  const entry = submissionCountStore.get(ip);

  if (!entry) {
    submissionCountStore.set(ip, {
      count: 1,
      createdAt: Date.now(),
    });
  } else {
    entry.count += 1;
    submissionCountStore.set(ip, entry);
  }
}

/**
 * Decrement submission count for an IP (when submission is processed)
 */
export function decrementSubmissionCount(request: NextRequest): void {
  const ip = getClientIP(request);
  const entry = submissionCountStore.get(ip);

  if (entry && entry.count > 0) {
    entry.count -= 1;
    if (entry.count === 0) {
      submissionCountStore.delete(ip);
    } else {
      submissionCountStore.set(ip, entry);
    }
  }
}

/**
 * Get current submission count for an IP
 */
export function getSubmissionCount(request: NextRequest): number {
  const ip = getClientIP(request);
  const entry = submissionCountStore.get(ip);
  return entry?.count || 0;
}
