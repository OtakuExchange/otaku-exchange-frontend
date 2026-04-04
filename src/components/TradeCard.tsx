import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PayoutPreview, Pool } from "../models/models";
import { useApi } from "../hooks/useApi";
import { useRefreshCash } from "../contexts/RefreshCashContext";
import { entityTextColor } from "../utils/entityTextColor";

function formatUsdFromCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function PayoutPreviewRow({
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

function useTradeModel({
  selectedPool,
  onBuySuccess,
}: {
  selectedPool: Pool | null;
  onBuySuccess?: () => void;
}) {
  const { createStake, fetchPayoutPreview } = useApi();
  const refreshCash = useRefreshCash();
  const queryClient = useQueryClient();

  const [rawAmount, setRawAmount] = useState("");
  const [buying, setBuying] = useState(false);
  const [payoutPreview, setPayoutPreview] = useState<PayoutPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const amountCents = useMemo(() => {
    if (!rawAmount) return 0;
    const n = parseInt(rawAmount, 10);
    return Number.isFinite(n) ? n : 0;
  }, [rawAmount]);

  useEffect(() => {
    const eventId = selectedPool?.eventId;
    const poolId = selectedPool?.id;
    if (!eventId || !poolId || amountCents <= 0) {
      setPayoutPreview(null);
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    const timer = setTimeout(() => {
      fetchPayoutPreview(eventId, poolId, amountCents)
        .then((preview) => {
          if (cancelled) return;
          setPayoutPreview(preview);
        })
        .catch(() => {
          if (cancelled) return;
          setPayoutPreview(null);
        })
        .finally(() => {
          if (cancelled) return;
          setPreviewLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedPool?.eventId, selectedPool?.id, amountCents, fetchPayoutPreview]);

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setRawAmount(digits);
  }

  const displayAmount = amountCents > 0 ? formatUsdFromCents(amountCents) : "";

  async function handleBuy() {
    if (!selectedPool) return;
    const stakeCents = parseInt(rawAmount, 10);
    if (!Number.isFinite(stakeCents) || stakeCents <= 0) return;

    setBuying(true);
    try {
      await createStake(selectedPool.id, stakeCents);
      const label = selectedPool.entity?.name ?? selectedPool.label;
      setToast({
        message: `Bought ${formatUsdFromCents(stakeCents)} stake in ${label}`,
        severity: "success",
      });
      setToastOpen(true);
      refreshCash();
      queryClient.invalidateQueries({ queryKey: ["portfolio", "me"] });
      onBuySuccess?.();
      setRawAmount("");
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to place order", severity: "error" });
      setToastOpen(true);
    } finally {
      setBuying(false);
    }
  }

  return {
    rawAmount,
    amountCents,
    displayAmount,
    buying,
    payoutPreview,
    previewLoading,
    toastOpen,
    toast,
    setToastOpen,
    handleAmountChange,
    handleBuy,
  };
}

export function TradeCardDesktop({
  pools,
  selectedPool,
  onPoolChange,
  onBuySuccess,
}: {
  pools: Pool[];
  selectedPool: Pool | null;
  onPoolChange: (pool: Pool) => void;
  onBuySuccess?: () => void;
}) {
  const model = useTradeModel({ selectedPool, onBuySuccess });

  return (
    <Card sx={{ width: { xs: "100%", sm: "25%" }, flexShrink: 0, borderRadius: 3 }}>
      <CardContent>
        {selectedPool && (
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            {selectedPool.entity?.logoPath && (
              <Box
                component="img"
                src={selectedPool.entity.logoPath}
                sx={{ width: 48, height: 48, borderRadius: 0.5, flexShrink: 0 }}
              />
            )}
            <Typography variant="body2" fontWeight="bold">
              {selectedPool.entity?.name ?? selectedPool.label}
            </Typography>
          </Stack>
        )}
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
            onChange={model.handleAmountChange}
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
          />
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
            {model.buying ? <CircularProgress size={20} color="inherit" /> : "Buy"}
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

export function TradeDockMobile({
  pools,
  selectedPool,
  onPoolChange,
  onBuySuccess,
}: {
  pools: Pool[];
  selectedPool: Pool | null;
  onPoolChange: (pool: Pool) => void;
  onBuySuccess?: () => void;
}) {
  const model = useTradeModel({ selectedPool, onBuySuccess });
  const poolLabel = selectedPool
    ? selectedPool.entity?.abbreviatedName ??
      selectedPool.entity?.name ??
      selectedPool.label
    : "Select a pool";

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (t) => t.zIndex.drawer + 1,
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 1.25,
          pb: "calc(env(safe-area-inset-bottom) + 12px)",
          maxWidth: 680,
          mx: "auto",
        }}
      >
        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              overflowX: "auto",
              pb: 0.25,
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {pools.map((pool) => {
              const color = pool.entity?.color ?? "#1565c0";
              const selected = selectedPool?.id === pool.id;
              return (
                <Button
                  key={pool.id}
                  size="small"
                  variant="contained"
                  onClick={() => onPoolChange(pool)}
                  sx={{
                    flexShrink: 0,
                    height: 34,
                    minHeight: 34,
                    px: 1.25,
                    borderRadius: 999,
                    bgcolor: color + "26",
                    color: entityTextColor(color),
                    "&:hover": { bgcolor: color + "40" },
                    fontWeight: 900,
                    textTransform: "none",
                    opacity: selected ? 1 : 0.55,
                  }}
                >
                  {pool.entity?.abbreviatedName ?? pool.label}
                </Button>
              );
            })}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 900, flexGrow: 1, minWidth: 0 }}
            >
              {poolLabel}
            </Typography>
            {selectedPool?.entity?.color && (
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: selectedPool.entity.color,
                  flexShrink: 0,
                }}
              />
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              fullWidth
              placeholder="$0.00"
              value={model.displayAmount}
              onChange={model.handleAmountChange}
              slotProps={{ htmlInput: { inputMode: "numeric" } }}
            />
            <Button
              variant="contained"
              onClick={model.handleBuy}
              disabled={!selectedPool || model.buying || !model.rawAmount}
              sx={{ bgcolor: "#1565c0", "&:hover": { bgcolor: "#1976d2" }, fontWeight: 900, px: 2 }}
            >
              {model.buying ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                "Buy"
              )}
            </Button>
          </Stack>

          {selectedPool && model.amountCents > 0 && (
            <PayoutPreviewRow
              payoutPreview={model.payoutPreview}
              loading={model.previewLoading}
            />
          )}

          <Divider sx={{ display: { xs: "block", sm: "none" } }} />
        </Stack>
      </Box>

      <Snackbar
        open={model.toastOpen}
        autoHideDuration={3000}
        onClose={() => model.setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: 12 }}
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
            py: 1.25,
            px: 2,
          }}
        >
          {model.toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function TradeCard(props: {
  pools: Pool[];
  selectedPool: Pool | null;
  onPoolChange: (pool: Pool) => void;
  onBuySuccess?: () => void;
}) {
  return <TradeCardDesktop {...props} />;
}
