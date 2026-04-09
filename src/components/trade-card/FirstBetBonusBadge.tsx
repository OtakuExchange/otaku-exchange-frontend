import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

export function FirstBetBonusBadge() {
  return (
    <Tooltip
      title="First bet? We'll match it up to $500 for free."
      placement="left"
      arrow
    >
      <Typography
        variant="caption"
        sx={{
          color: "#16191d",
          bgcolor: "#FFD700",
          px: 0.75,
          py: 0.25,
          borderRadius: 999,
          fontWeight: 800,
          lineHeight: 1,
          cursor: "default",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        ⚡ Bonus
      </Typography>
    </Tooltip>
  );
}