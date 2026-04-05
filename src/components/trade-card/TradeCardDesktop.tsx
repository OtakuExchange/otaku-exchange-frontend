import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTradeModel } from "../../hooks/useTradeModel";
import type { Pool } from "../../models/models";
import { entityTextColor } from "../../utils/entityTextColor";
import { PayoutPreviewRow } from "./PayoutPreviewRow";

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
    <Card
      sx={{ width: { xs: "100%", sm: "25%" }, flexShrink: 0, borderRadius: 3 }}
    >
      <CardContent>
        {selectedPool && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 2 }}
          >
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
