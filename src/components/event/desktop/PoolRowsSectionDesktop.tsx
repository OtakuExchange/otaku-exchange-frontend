import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PoolStat } from "../types";

export function PoolRowsSectionDesktop({
  poolStats,
  totalVolume,
  selectedPoolId,
  onSelectPool,
}: {
  poolStats: PoolStat[];
  totalVolume: number;
  selectedPoolId: string | null;
  onSelectPool: (poolId: string) => void;
}) {
  if (poolStats.length === 0) return null;
  return (
    <Stack sx={{ my: 2, display: { xs: "none", md: "flex" } }}>
      {poolStats.map((s, i, arr) => (
        <Box key={s.pool.id}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            onClick={() => onSelectPool(s.pool.id)}
            sx={{
              height: 74,
              cursor: "pointer",
              borderRadius: "10px",
              px: 1,
              borderColor:
                selectedPoolId === s.pool.id ? "divider" : "transparent",
              bgcolor: "transparent",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ width: "20%", flexShrink: 0 }}
            >
              {s.pool.entity?.logoPath && (
                <Box
                  component="img"
                  src={s.pool.entity.logoPath}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 0.5,
                    flexShrink: 0,
                  }}
                />
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                  {s.pool.entity?.name ?? s.pool.label}
                </Typography>
                <Typography
                  sx={{ fontSize: "13px", color: "#7B8996", fontWeight: 600 }}
                >
                  {s.volumeUsd} Vol.
                </Typography>
              </Box>
            </Stack>
            <Box
              sx={{
                flexGrow: 1,
                mx: 1.5,
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width:
                    totalVolume > 0
                      ? `${(s.pool.volume / totalVolume) * 100}%`
                      : "0%",
                  maxWidth: "calc(100% - 130px)",
                  height: 16,
                  borderRadius: 1,
                  bgcolor: s.color,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: "36px",
                  fontWeight: 600,
                  color: s.color,
                  lineHeight: 1,
                  ml: "18px",
                  flexShrink: 0,
                }}
              >
                {totalVolume > 0
                  ? `${Math.round((s.pool.volume / totalVolume) * 100)}%`
                  : "0%"}
              </Typography>
            </Box>
          </Stack>
          {i < arr.length - 1 && <Divider sx={{ mx: "10px" }} />}
        </Box>
      ))}
    </Stack>
  );
}
