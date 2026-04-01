import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Pool } from "../models/models";
import { useApi } from "../hooks/useApi";
import { useRefreshCash } from "../contexts/RefreshCashContext";
import { entityTextColor } from "../utils/entityTextColor";

export default function TradeCard({
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
  const { createStake } = useApi();
  const refreshCash = useRefreshCash();
  const queryClient = useQueryClient();
  const [rawAmount, setRawAmount] = useState("");
  const [buying, setBuying] = useState(false);

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setRawAmount(digits);
  }

  const dollars = rawAmount ? (parseInt(rawAmount, 10) / 100).toFixed(2) : "";
  const displayAmount = dollars ? `$${dollars}` : "";
  const [toastOpen, setToastOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  async function handleBuy() {
    if (!selectedPool) return;
    setBuying(true);
    try {
      await createStake(selectedPool.id, parseInt(rawAmount, 10));
      const usd = `$${(parseInt(rawAmount, 10) / 100).toFixed(2)}`;
      const label = selectedPool.entity?.name ?? selectedPool.label;
      setToast({ message: `Bought ${usd} stake in ${label}`, severity: "success" });
      setToastOpen(true);
      refreshCash();
      queryClient.invalidateQueries({ queryKey: ["portfolio", "me"] });
      onBuySuccess?.();
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to place order", severity: "error" });
      setToastOpen(true);
    } finally {
      setBuying(false);
    }
  }

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
            value={displayAmount}
            onChange={handleAmountChange}
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleBuy}
            disabled={buying || !rawAmount}
            sx={{
              bgcolor: "#1565c0",
              "&:hover": { bgcolor: "#1976d2" },
              fontWeight: "bold",
            }}
          >
            {buying ? <CircularProgress size={20} color="inherit" /> : "Buy"}
          </Button>
        </Stack>
      </CardContent>
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity={toast?.severity} onClose={() => setToastOpen(false)} sx={{ width: "100%", bgcolor: "#16191d", border: "1px solid #4C4E51", borderRadius: 2, color: "#fff", fontSize: "16px", py: 1.5, px: 2 }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}
