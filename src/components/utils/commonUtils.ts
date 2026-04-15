export const safeParse = (value: any) => {
  try {
    if (!value || value === " " || value === "") return [];
    return JSON.parse(value);
  } catch {
    return [];
  }
};

export const getTruncatedText = (
  text: string,
  expanded: boolean,
  limit: number = 160
) => {
  if (!text) return "";
  return expanded || text.length <= limit
    ? text
    : text.slice(0, limit) + "...";
};

export const getCleanStatus = (status?: string) => {
  if (!status) return "";
  const dashIndex = status.indexOf("-");
  return dashIndex >= 0
    ? status.substring(dashIndex + 1).trim()
    : status.trim();
};