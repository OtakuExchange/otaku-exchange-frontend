import { useEffect } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTradeModel } from "../../hooks/useTradeModel";
import type { Pool } from "../../models/models";
import { entityTextColor } from "../../utils/entityTextColor";
import { PayoutPreviewRow } from "./PayoutPreviewRow";
import { FirstBetBonusBadge, FirstBetBonusInfo } from "./FirstBetBonusBadge";

export function TradeCardDesktop({
  pools,
  selectedPool,
  onPoolChange,
  onBuySuccess,
  isFirstStakeBonusEligible,
  stakeCents,
  onStakeCentsChange,
}: {
  pools: Pool[];
  selectedPool: Pool | null;
  onPoolChange: (pool: Pool) => void;
  onBuySuccess?: () => void;
  isFirstStakeBonusEligible?: boolean;
  stakeCents?: number;
  onStakeCentsChange?: (cents: number) => void;
}) {
  const totalVolume = pools.reduce((sum, p) => sum + p.volume, 0);
  const model = useTradeModel({
    selectedPool,
    totalVolume,
    onBuySuccess,
    isFirstStakeBonusEligible,
  });

  const controlledStakeCents = stakeCents ?? model.amountCents;

  useEffect(() => {
    if (stakeCents == null) return;
    model.setAmountCents(stakeCents);
  }, [stakeCents]);

  function updateStake(next: number) {
    model.setAmountCents(next);
    onStakeCentsChange?.(next);
  }

  return (
    <Card
      sx={{ width: { xs: "100%", sm: "25%" }, flexShrink: 0, borderRadius: 3 }}
    >
      <CardContent>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          {selectedPool ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ minWidth: 0 }}
            >
              {selectedPool.entity?.logoPath && (
                <Box
                  component="img"
                  src={selectedPool.entity.logoPath}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 0.5,
                    flexShrink: 0,
                  }}
                />
              )}
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ minWidth: 0 }}
              >
                {selectedPool.entity?.name ?? selectedPool.label}
              </Typography>
            </Stack>
          ) : (
            <Box />
          )}
          {isFirstStakeBonusEligible && <FirstBetBonusBadge />}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {pools.map((pool) => {
            const color = pool.entity?.color ?? "#1565c0";
            return (
              <Button
                key={pool.id}
                variant="contained"
                fullWidth
                onClick={() => onPoolChange(pool)}
                sx={{
                  bgcolor: color + "26",
                  color: entityTextColor(color),
                  "&:hover": { bgcolor: color + "40" },
                  fontWeight: "bold",
                  opacity: selectedPool?.id === pool.id ? 1 : 0.5,
                }}
              >
                {pool.entity?.abbreviatedName ?? pool.label}
              </Button>
            );
          })}
        </Stack>

        <Stack spacing={1}>
          <TextField
            size="small"
            fullWidth
            placeholder="$0.00"
            value={model.displayAmount}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              const n = digits ? parseInt(digits, 10) : 0;
              updateStake(Number.isFinite(n) ? n : 0);
            }}
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
          />
          <Stack spacing={0.75}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" sx={{ color: "#7B8996", fontWeight: 700 }}>
                Stake
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {model.displayAmount || "$0.00"}
              </Typography>
            </Stack>
            <Slider
              value={controlledStakeCents}
              min={0}
              max={model.userBalance ?? 99999999}
              step={100} // $1 steps
              disabled={!selectedPool}
              onChange={(_e, v) => {
                const next = Array.isArray(v) ? v[0] : v;
                updateStake(next);
              }}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `$${(v / 100).toFixed(0)}`}
            />
          </Stack>

          {model.bonusCents > 0 && model.amountCents > 0 && (
            <FirstBetBonusInfo
              amountCents={model.amountCents}
              bonusCents={model.bonusCents}
              totalStakeCents={model.effectiveStakeCents}
            />
          )}
          <Button
            variant="contained"
            fullWidth
            onClick={model.handleBuy}
            disabled={model.buying || !model.rawAmount}
            sx={{
              bgcolor: "#1565c0",
              "&:hover": { bgcolor: "#1976d2" },
              fontWeight: "bold",
            }}
          >
            {model.buying ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Buy"
            )}
          </Button>
          {selectedPool && model.amountCents > 0 && (
            <PayoutPreviewRow
              payoutPreview={model.payoutPreview}
              loading={model.previewLoading}
            />
          )}
        </Stack>
      </CardContent>

      <Snackbar
        open={model.toastOpen}
        autoHideDuration={3000}
        onClose={() => model.setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ mb: { xs: 10, md: 0 } }}
      >
        <Alert
          severity={model.toast?.severity}
          onClose={() => model.setToastOpen(false)}
          sx={{
            width: "100%",
            bgcolor: "#16191d",
            border: "1px solid #4C4E51",
            borderRadius: 2,
            color: "#fff",
            fontSize: "16px",
            py: 1.5,
            px: 2,
          }}
        >
          {model.toast?.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}
