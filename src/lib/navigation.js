export function safeReturnTo(value, fallback = '/dashboard') {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    value.includes('\\') ||
    /^\/(login|register)([/?#]|$)/.test(value)
  )
    return fallback;
  return value;
}
