import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PoolStat } from "../types";

export function PoolRowsSectionMobile({
  poolStats,
  selectedPoolId,
  onSelectPool,
}: {
  poolStats: PoolStat[];
  selectedPoolId: string | null;
  onSelectPool: (poolId: string) => void;
}) {
  if (poolStats.length === 0) return null;

  return (
    <Stack spacing={1} sx={{ my: 1.5, display: { xs: "flex", md: "none" } }}>
      {poolStats.map((s) => {
        const isSelected = selectedPoolId === s.pool.id;
        return (
          <Box
            key={s.pool.id}
            onClick={() => onSelectPool(s.pool.id)}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: isSelected ? "divider" : "transparent",
              bgcolor: isSelected ? "action.selected" : "transparent",
              px: 1,
              py: 1,
              cursor: "pointer",
              "&:active": { transform: "scale(0.997)" },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {s.pool.entity?.logoPath ? (
                <Box
                  component="img"
                  src={s.pool.entity.logoPath}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 0.5,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Box sx={{ width: 28, height: 28, flexShrink: 0 }} />
              )}

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.pool.entity?.name ?? s.pool.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#7B8996", fontWeight: 700 }}
                >
                  {s.volumeUsd} Vol.
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: "16px",
                  color: s.color,
                  flexShrink: 0,
                }}
              >
                {s.pct}%
              </Typography>
            </Stack>

            <Box
              sx={{
                mt: 0.75,
                height: 10,
                borderRadius: 999,
                bgcolor: "action.hover",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${s.pct}%`,
                  bgcolor: s.color,
                  borderRadius: 999,
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
