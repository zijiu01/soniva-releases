export type DateLocale = "zh-CN" | "en-US";

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const EN_MONTHS_SHORT = EN_MONTHS.map((m) => m.slice(0, 3));

export function parseISODate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** "2025 年 6 月" / "June 2025" */
export function formatMonthLabel(year: number, month: number, locale: DateLocale): string {
  if (locale === "en-US") return `${EN_MONTHS[month - 1]} ${year}`;
  return `${year} 年 ${month} 月`;
}

/** "6月14日" / "Jun 14" */
export function formatDayLabel(month: number, day: number, locale: DateLocale): string {
  if (locale === "en-US") return `${EN_MONTHS_SHORT[month - 1]} ${day}`;
  return `${month}月${day}日`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** 该月 1 号的星期几（0 = 周日），用于月历前置空位。 */
export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}
