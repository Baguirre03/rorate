/**
 * Input sanitization utilities for user-submitted data
 */

/**
 * Sanitize string input by trimming, limiting length, and removing dangerous characters
 * @param input - The input string to sanitize
 * @param maxLength - Maximum length (default: 255)
 * @param allowSpecialChars - Whether to allow special characters (default: false)
 * @returns Sanitized string
 */
export function sanitizeInput(
  input: string | null | undefined,
  maxLength: number = 255,
  allowSpecialChars: boolean = false
): string {
  if (!input) return "";

  let sanitized = input.trim();

  // Remove HTML tags and dangerous characters
  if (!allowSpecialChars) {
    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, "");
    // Remove script tags and event handlers
    sanitized = sanitized.replace(/javascript:/gi, "");
    sanitized = sanitized.replace(/on\w+\s*=/gi, "");
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>'"]/g, "");
  }

  // Limit length
  sanitized = sanitized.slice(0, maxLength);

  return sanitized;
}

/**
 * Sanitize company name
 */
export function sanitizeCompanyName(name: string | null | undefined): string {
  const sanitized = sanitizeInput(name, 100, true);
  return sanitized.replace(/[<>'"]/g, "").trim();
}

/**
 * Sanitize school name
 */
export function sanitizeSchoolName(name: string | null | undefined): string {
  const sanitized = sanitizeInput(name, 100, true);
  return sanitized
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

/**
 * Sanitize source field
 */
export function sanitizeSource(source: string | null | undefined): string {
  return sanitizeInput(source, 255, false).trim();
}

/**
 * Validate and sanitize year
 */
export function validateYear(
  year: number | string | null | undefined
): number | null {
  if (year === null || year === undefined) return null;

  const yearNum = typeof year === "string" ? parseInt(year, 10) : year;

  if (isNaN(yearNum)) return null;

  // Validate year is in reasonable range (2000-2100)
  if (yearNum < 2000 || yearNum > 2100) return null;

  return yearNum;
}

/**
 * Validate and sanitize term
 * Accepts common terms but allows any reasonable string
 */
export function validateTerm(term: string | null | undefined): string | null {
  if (!term) return null;

  const sanitized = sanitizeInput(term, 50, true).trim();

  // Must have at least 1 character after sanitization
  if (sanitized.length === 0) return null;

  // Remove only dangerous characters, allow normal text
  return sanitized
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

/**
 * Validate and sanitize intern type
 * Accepts any reasonable string (allows flexibility)
 */
export function validateInternType(
  internType: string | null | undefined
): string | null {
  if (!internType) return null;

  const sanitized = sanitizeInput(internType, 100, true).trim();

  if (sanitized.length === 0) return null;

  return sanitized
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

/**
 * Validate position type
 */
export function validatePositionType(
  positionType: string | null | undefined
): "Full Time" | "Intern" | null {
  if (!positionType) return null;

  const sanitized = sanitizeInput(positionType, 20, false).trim();

  if (sanitized === "Full Time" || sanitized === "Intern") {
    return sanitized;
  }

  return null;
}
