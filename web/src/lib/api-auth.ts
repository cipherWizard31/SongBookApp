import { NextRequest } from 'next/server';

export function verifyMobileApiKey(request: NextRequest): boolean {
  const expectedKey = process.env.MOBILE_API_KEY;
  if (!expectedKey) return false;
  const providedKey = request.headers.get('x-api-key');
  return providedKey === expectedKey;
}

