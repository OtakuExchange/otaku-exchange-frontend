import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatUsdFromCents } from "../../utils/formatMoney";

export type FirstBetBonusBadgeVariant = "inline" | "icon";

const labelSx = {
  fontWeight: 800,
  letterSpacing: "0.08em",
  lineHeight: 1,
  fontSize: "11px",
} as const;

export function FirstBetBonusBadge({
  variant = "inline",
}: {
  variant?: FirstBetBonusBadgeVariant;
}) {
  return (
    <Tooltip
      title="First bet? We'll match it up to $500 for free."
      placement="left"
      arrow
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          flexShrink: 0,
          cursor: "default",
          userSelect: "none",
        }}
      >
        <Box
          component="span"
          sx={{
            width: 22,
            height: 22,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#FFD700",
            lineHeight: 1,
            fontSize: 15,
            filter:
              "drop-shadow(0 0 6px rgba(255, 215, 0, 0.55)) drop-shadow(0 0 2px rgba(255, 215, 0, 0.35))",
            textShadow: "0 0 10px rgba(255, 215, 0, 0.35)",
          }}
        >
          ⚡
        </Box>
        {variant === "inline" && (
          <Typography
            variant="caption"
            sx={{ ...labelSx, color: "#FFD700", ml: 0.5 }}
          >
            BONUS
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

export function FirstBetBonusInfo({
  amountCents,
  bonusCents,
  totalStakeCents,
}: {
  amountCents: number;
  bonusCents: number;
  totalStakeCents: number;
}) {
  return (
    <Typography
      variant="caption"
      sx={{ color: "#7B8996", fontWeight: 700, letterSpacing: "0.02em" }}
    >
      You pay {formatUsdFromCents(amountCents)} +{" "}
      <Box component="span" sx={{ color: "#FFD700" }}>
        {formatUsdFromCents(bonusCents)}
      </Box>{" "}
      bonus = {formatUsdFromCents(totalStakeCents)} bet
    </Typography>
  );
}
