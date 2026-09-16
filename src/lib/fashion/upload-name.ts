const SAFE_NAME = /^(fashion|avatar)-[A-Za-z0-9._-]+\.(jpe?g|png|webp|gif)$/i;

export function isSafeFashionUploadName(name: string): boolean {
  if (!name || name.includes("/") || name.includes("\\") || name.includes("..")) return false;
  return SAFE_NAME.test(name);
}
