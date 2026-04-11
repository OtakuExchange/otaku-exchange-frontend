import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { entityTextColor } from "../../utils/entityTextColor";
import type { Pool } from "../../models/models";

const scrollableSx = {
  maxHeight: 90,
  overflowY: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": { display: "none" },
} as const;

export function DesktopEventCardBody({
  pools,
  totalVolume,
  isMulti,
  onSelectPool,
  highlightWinnerPool = false,
}: {
  pools: Pool[];
  totalVolume: number;
  isMulti: boolean;
  onSelectPool: (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>, poolId: string) => void;
  highlightWinnerPool?: boolean;
}) {
  return (
    <Box sx={{ display: { xs: "none", md: "block" } }}>
      <Stack sx={{ mb: 1, ...(isMulti && scrollableSx) }}>
        {pools.map((pool, i) => {
          const pct =
            totalVolume > 0 ? Math.round((pool.volume / totalVolume) * 100) : 0;
          const isWinner = highlightWinnerPool && pool.isWinner;
          return (
            <Stack
              key={pool.id}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                height: 36,
                minHeight: 36,
                mb: i === 0 ? "4px" : 0,
                cursor: "pointer",
                px: 1,
                borderRadius: 1,
                border: "1px solid",
                borderColor: isWinner ? "success.main" : "transparent",
                bgcolor: isWinner ? "rgba(61, 180, 104, 0.08)" : "transparent",
              }}
              onClick={(e) => onSelectPool(e, pool.id)}
            >
              {pool.entity ? (
                <Box
                  component="img"
                  src={pool.entity.logoPath}
                  sx={{
                    width: 24,
                    height: 24,
                    flexShrink: 0,
                    borderRadius: 0.5,
                  }}
                />
              ) : (
                <Box sx={{ width: 24, height: 24, flexShrink: 0 }} />
              )}
              <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 600 }}>
                {pool.entity?.name ?? pool.label}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: "#7B8996" }}
              >
                {pct}%
              </Typography>
            </Stack>
          );
        })}
      </Stack>

      {!isMulti && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mt: "auto", height: 40, minHeight: 40 }}
        >
          {pools.map((pool) => {
            const color = pool.entity?.color ?? "#1565c0";
            const isWinner = highlightWinnerPool && pool.isWinner;
            return (
              <Button
                key={pool.id}
                size="small"
                variant="contained"
                fullWidth
                sx={{
                  height: 40,
                  minHeight: 40,
                  py: 0,
                  fontWeight: "bold",
                  bgcolor: color + "26",
                  color: entityTextColor(color),
                  "&:hover": { bgcolor: color + "40" },
                  border: "1px solid",
                  borderColor: isWinner ? "success.main" : "transparent",
                }}
                onClick={(e) => onSelectPool(e, pool.id)}
              >
                {pool.entity?.abbreviatedName ?? pool.label}
              </Button>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
