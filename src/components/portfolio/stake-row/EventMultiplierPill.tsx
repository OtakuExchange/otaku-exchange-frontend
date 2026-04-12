import Box from "@mui/material/Box";
import { multiplierColor } from "../../../utils/parimutuel";

export function EventMultiplierPill({ multiplier }: { multiplier: number }) {
  if (multiplier <= 1) return null;
  return (
    <Box
      component="span"
      sx={{
        color: "#16191d",
        bgcolor: multiplierColor(multiplier),
        px: 0.6,
        py: 0.2,
        borderRadius: 999,
        fontWeight: 800,
        lineHeight: 1,
        fontSize: "11px",
        flexShrink: 0,
      }}
    >
      {multiplier}x
    </Box>
  );
}

