import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatCentsCompact } from "../../utils/formatMoney";

export function OutcomeAmountChip({
  variant,
  amountCents,
}: {
  variant: "winner_profit" | "resolved_loss" | "open_payout";
  amountCents: number;
}) {
  if (variant === "winner_profit") {
    return (
      <Box
        sx={{
          bgcolor: "#3DB468",
          borderRadius: 1,
          px: 1,
          height: 28,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={800}
          sx={{ color: "#16191d", fontSize: "13px", lineHeight: 1 }}
        >
          +{formatCentsCompact(amountCents)}
        </Typography>
      </Box>
    );
  }

  if (variant === "resolved_loss") {
    return (
      <Box
        sx={{
          bgcolor: "#AC3031",
          borderRadius: 1,
          px: 1,
          height: 28,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={800}
          sx={{ color: "#16191d", fontSize: "13px", lineHeight: 1 }}
        >
          -{formatCentsCompact(amountCents)}
        </Typography>
      </Box>
    );
  }

  return (
    <Typography
      variant="body2"
      fontWeight={800}
      sx={{ color: "#3DB468", fontSize: "13px", lineHeight: 1, flexShrink: 0 }}
    >
      {formatCentsCompact(amountCents)}
    </Typography>
  );
}

