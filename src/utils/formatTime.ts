export function formatCloseTime(closeTime: string): string | null {
  const d = new Date(closeTime);
  if (Number.isNaN(d.getTime())) return null;
  const dow = d.toLocaleString("en-US", { weekday: "short" });
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const time = d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dow} ${month} ${day} @ ${time}`;
}
