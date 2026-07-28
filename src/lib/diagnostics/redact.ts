export function redactUrl(url?: string): string {
  if (!url) return 'Not configured';
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '***';
    if (parsed.pathname.length > 15) {
      parsed.pathname = parsed.pathname.substring(0, 5) + '...' + parsed.pathname.slice(-4);
    }
    return parsed.toString();
  } catch {
    return 'Invalid URL';
  }
}

export function redactContractId(id?: string): string {
  if (!id) return 'Not configured';
  if (id.length < 12) return id;
  return id.substring(0, 4) + '...' + id.slice(-4);
}
