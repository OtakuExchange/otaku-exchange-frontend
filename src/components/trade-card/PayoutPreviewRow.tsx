import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PayoutPreview } from "../../models/models";
import { formatUsdFromCents } from "../../utils/formatMoney";

export function PayoutPreviewRow({
    payoutPreview,
    loading,
  }: {
    payoutPreview: PayoutPreview | null;
    loading: boolean;
  }) {
    const winProfit =
      payoutPreview != null
        ? payoutPreview.projectedPayout - payoutPreview.hypotheticalStake
        : null;
  
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
          {loading && <CircularProgress size={14} />}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 800,
              color: winProfit != null ? "success.main" : "text.secondary",
            }}
          >
            {winProfit != null ? `+${formatUsdFromCents(winProfit)}` : "—"}
          </Typography>
        </Stack>
      </Box>
    );
  }