import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { EventStatus } from "../models/models";

const labelSx = {
  fontWeight: 800,
  letterSpacing: "0.08em",
  lineHeight: 1,
  fontSize: "11px",
} as const;

const liveDotSx = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  bgcolor: "#ff3b30",
  boxShadow: "0 0 10px rgba(255, 59, 48, 0.9)",
  animation: "liveBlink 1s ease-in-out infinite",
  "@keyframes liveBlink": {
    "0%, 100%": { opacity: 1, transform: "scale(1)" },
    "50%": { opacity: 0.25, transform: "scale(0.85)" },
  },
} as const;

function formatCloseTime(closeTime: string): string | null {
  const d = new Date(closeTime);
  if (Number.isNaN(d.getTime())) return null;
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const time = d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${month} ${day} @ ${time}`;
}

export function EventStatusTag({
  status,
  closeTime,
}: {
  status: EventStatus;
  closeTime?: string | null;
}) {
  const s = (status ?? "").toLowerCase();
  const isLive = s === "staking_closed";
  const isOpen = s === "open";
  const isHidden = s === "hidden";
  if (!isLive && !isOpen && !isHidden) return null;

  const formattedClose = closeTime ? formatCloseTime(closeTime) : null;

  const badgeColor = isLive ? "#ff3b30" : isOpen ? "#3DB468" : "#7B8996";
  const badgeBg =
    isLive ? "rgba(255, 59, 48, 0.14)"
      : isOpen ? "rgba(61, 180, 104, 0.14)"
      : "rgba(123, 137, 150, 0.16)";
  const badgeBorder =
    isLive ? "rgba(255, 59, 48, 0.35)"
      : isOpen ? "rgba(61, 180, 104, 0.35)"
      : "rgba(123, 137, 150, 0.35)";

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
      <Box
        sx={{
          px: 0.75,
          py: 0.25,
          borderRadius: 999,
          bgcolor: badgeBg,
          border: `1px solid ${badgeBorder}`,
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        {isLive && <Box sx={liveDotSx} />}
        <Typography
          variant="caption"
          sx={{
            ...labelSx,
            color: badgeColor,
          }}
        >
          {isLive ? "LIVE" : isOpen ? "OPEN" : "HIDDEN"}
        </Typography>
      </Box>
      {formattedClose && (
        <Typography
          variant="caption"
          sx={{
            lineHeight: 1,
            fontSize: "11px",
            color: "#7B8996",
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          {formattedClose}
        </Typography>
      )}
    </Box>
  );
}

