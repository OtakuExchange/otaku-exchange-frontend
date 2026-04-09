import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts/PieChart";
import type { PoolStat } from "../types";

export function PoolRowsSectionDesktop({
  poolStats,
  totalVolume,
  onSelectPool,
}: {
  poolStats: PoolStat[];
  totalVolume: number;
  selectedPoolId: string | null;
  onSelectPool: (poolId: string) => void;
}) {
  if (poolStats.length === 0) return null;

  const data = poolStats.map((s) => ({
    id: s.pool.id,
    value: s.pool.volume,
    color: s.color,
    label: s.pool.entity?.abbreviatedName ?? s.pool.label,
  }));

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ my: 2, display: { xs: "none", md: "flex" } }}>
      <PieChart
        series={[{ data, cx: 90, cy: 90, innerRadius: 50, outerRadius: 90 }]}
        width={200}
        height={200}
        slots={{ legend: () => null }}
      />
      <Stack spacing={1} sx={{ flexGrow: 1 }}>
        {poolStats.map((s) => (
          <Stack
            key={s.pool.id}
            direction="row"
            alignItems="center"
            spacing={1.5}
            onClick={() => onSelectPool(s.pool.id)}
            sx={{ cursor: "pointer", borderRadius: 2, px: 1, py: 0.75, "&:hover": { bgcolor: "action.hover" } }}
          >
            {s.pool.entity?.logoPath && (
              <Box component="img" src={s.pool.entity.logoPath} sx={{ width: 40, height: 40, borderRadius: 0.5, flexShrink: 0 }} />
            )}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "15px", fontWeight: 600 }}>
                {s.pool.entity?.name ?? s.pool.label}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#7B8996", fontWeight: 600 }}>
                {s.volumeUsd} Vol.
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "24px", fontWeight: 700, color: s.color, flexShrink: 0 }}>
              {totalVolume > 0 ? `${Math.round((s.pool.volume / totalVolume) * 100)}%` : "0%"}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
