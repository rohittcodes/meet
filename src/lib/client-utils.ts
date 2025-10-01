export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function decodePassphrase(passphrase: string): string {
  // Simple base64 decode for now
  try {
    return atob(passphrase);
  } catch {
    return passphrase;
  }
}
