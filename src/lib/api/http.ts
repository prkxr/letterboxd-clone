import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Authentication is required.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "You do not have permission to perform this action.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Resource not found.") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Unexpected server error.") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function parseIntParam(value: string | null, fallback: number, min = 1, max = 100) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export async function parseJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
