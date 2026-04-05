import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTradeModel } from "../../hooks/useTradeModel";
import type { Pool } from "../../models/models";
import { entityTextColor } from "../../utils/entityTextColor";
import { PayoutPreviewRow } from "./PayoutPreviewRow";

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
    ? (selectedPool.entity?.abbreviatedName ??
      selectedPool.entity?.name ??
      selectedPool.label)
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
              sx={{
                bgcolor: "#1565c0",
                "&:hover": { bgcolor: "#1976d2" },
                fontWeight: 900,
                px: 2,
              }}
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
