export function isEmail(str: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

export function isPhone(str: string): boolean {
  const phoneRegex = /^1(3[0-9]|5[0-3,5-9]|7[1-3,5-8]|8[0-9])\d{8}$/;
  return phoneRegex.test(str);
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}
