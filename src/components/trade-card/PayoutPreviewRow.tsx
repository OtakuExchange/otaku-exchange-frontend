import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import type { PayoutPreview } from "../../models/models";
import { formatUsdFromCents } from "../../utils/formatMoney";
import { multiplierColor } from "../../utils/parimutuel";

export function PayoutPreviewRow({
  eventMultiplier,
  bonusCents,
  baseProfitCents,
  payoutPreview,
}: {
  eventMultiplier: number;
  bonusCents: number;
  baseProfitCents: number | null;
  payoutPreview: PayoutPreview | null;
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });
  const winProfit =
    payoutPreview != null
      ? payoutPreview.projectedPayout - payoutPreview.hypotheticalStake
      : null;
  const hasBonus = bonusCents > 0;
  const hasMultiplier = eventMultiplier > 1;

  const tooltip = (
    <Stack spacing={0.5} sx={{ py: 0.25 }}>
      <Typography variant="caption" sx={{ fontWeight: 900 }}>
        Payout affected by:
      </Typography>

      {baseProfitCents != null && (
        <Typography variant="caption">
          Base Profit:{" "}
          <Box component="span" sx={{ color: "#b3bcc6", fontWeight: 900 }}>
            +{formatUsdFromCents(baseProfitCents)}
          </Box>
        </Typography>
      )}

      {hasBonus && (
        <Typography variant="caption">
          Bonus bet:{" "}
          <Box component="span" sx={{ color: "#FFD700", fontWeight: 900 }}>
            +{formatUsdFromCents(bonusCents)}
          </Box>
        </Typography>
      )}

      {hasMultiplier && (
        <Typography variant="caption">
          Profit multiplier:{" "}
          <Box component="span" sx={{ color: multiplierColor(eventMultiplier), fontWeight: 900 }}>
            ×{eventMultiplier}
          </Box>
        </Typography>
      )}

      {!hasBonus && !hasMultiplier && (
        <Typography variant="caption" sx={{ color: "#b3bcc6" }}>
          No bonus or multiplier applied
        </Typography>
      )}
    </Stack>
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 1.25,
        py: 0.75,
        borderRadius: 2,
        bgcolor: "action.hover",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Win payout
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip
          title={tooltip}
          placement="top"
          arrow
          disableHoverListener={!isDesktop}
          disableFocusListener={!isDesktop}
          disableTouchListener
        >
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontWeight: 800,
              color: winProfit != null ? "success.main" : "text.secondary",
              cursor: isDesktop ? "help" : "default",
            }}
          >
            {winProfit != null ? `+${formatUsdFromCents(winProfit)}` : "—"}
          </Typography>
        </Tooltip>
      </Stack>
    </Box>
  );
}

export function PayoutPreviewInfo({
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
