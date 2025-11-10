import { NextResponse } from "next/server";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data } as ApiResponse<T>, { status });
}

export function errorResponse(
  error: string,
  status: number = 500
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ error } as ApiResponse<never>, { status });
}

export function notFoundResponse(
  message: string = "Resource not found"
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ error: message } as ApiResponse<never>, {
    status: 404,
  });
}

export function unauthorizedResponse(
  message: string = "Unauthorized"
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ error: message } as ApiResponse<never>, {
    status: 401,
  });
}
