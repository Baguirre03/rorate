import { NextRequest, NextResponse } from "next/server";

/**
 * List of suspicious user agents that should be blocked or restricted
 */
const SUSPICIOUS_USER_AGENTS = [
  "curl",
  "wget",
  "python-requests",
  "go-http-client",
  "java/",
  "scrapy",
  "postman",
  "insomnia",
  "httpie",
  "rest-client",
];

/**
 * Check if user agent is suspicious (likely automated/bot)
 */
export function isSuspiciousUserAgent(userAgent: string | null): boolean {
  if (!userAgent) {
    return true; // No user agent is suspicious
  }

  const lowerUA = userAgent.toLowerCase();
  return SUSPICIOUS_USER_AGENTS.some((suspicious) =>
    lowerUA.includes(suspicious.toLowerCase())
  );
}

/**
 * Validate user agent and block suspicious ones
 */
export function validateUserAgent(request: NextRequest): {
  allowed: boolean;
  response?: NextResponse;
  userAgent?: string;
} {
  const userAgent = request.headers.get("user-agent");

  // Block requests without user agent
  if (!userAgent) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: "Invalid request",
          message: "Requests without user agent are not allowed.",
        },
        { status: 403 }
      ),
    };
  }

  // Block suspicious user agents (curl, wget, etc.)
  if (isSuspiciousUserAgent(userAgent)) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: "Invalid request",
          message:
            "Automated requests are not allowed. Please use a web browser.",
        },
        { status: 403 }
      ),
      userAgent,
    };
  }

  return {
    allowed: true,
    userAgent,
  };
}
