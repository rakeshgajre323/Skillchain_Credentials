export function getApiBase() {
  try {
    // Check for Vite environment variable
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) {
      return (import.meta as any).env.VITE_API_BASE_URL.replace(/\/+$/, '');
    }
    // Check for Next.js/Node environment variable
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
    }
  } catch (e) {
    // Ignore access errors in strict environments
  }
  
  // Fallback to localhost default
  return 'http://localhost:5000';
}

export async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}