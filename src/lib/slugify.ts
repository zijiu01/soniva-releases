export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_[\]()]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
