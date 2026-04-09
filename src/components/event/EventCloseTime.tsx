import Typography from "@mui/material/Typography";
import { formatCloseTime } from "../../utils/formatTime";

export function EventCloseTime({ closeTime }: { closeTime?: string | null }) {
  const formattedClose = closeTime ? formatCloseTime(closeTime) : null;
  if (!formattedClose) return null;

  return (
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
  );
}
