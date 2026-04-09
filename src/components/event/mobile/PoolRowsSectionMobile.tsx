import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts/PieChart";
import type { PoolStat } from "../types";

export function PoolRowsSectionMobile({
  poolStats,
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
    <Stack direction="row" alignItems="center" spacing={2} sx={{ my: 1.5, display: { xs: "flex", md: "none" } }}>
      <PieChart
        series={[{ data, cx: 70, cy: 70, innerRadius: 38, outerRadius: 70 }]}
        width={155}
        height={155}
        slots={{ legend: () => null }}
      />
      <Stack spacing={1} sx={{ flexGrow: 1 }}>
        {poolStats.map((s) => (
          <Stack
            key={s.pool.id}
            direction="row"
            alignItems="center"
            spacing={1}
            onClick={() => onSelectPool(s.pool.id)}
            sx={{ cursor: "pointer" }}
          >
            {s.pool.entity?.logoPath ? (
              <Box component="img" src={s.pool.entity.logoPath} sx={{ width: 28, height: 28, borderRadius: 0.5, flexShrink: 0 }} />
            ) : (
              <Box sx={{ width: 28, height: 28, flexShrink: 0 }} />
            )}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "14px", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.pool.entity?.name ?? s.pool.label}
              </Typography>
              <Typography variant="caption" sx={{ color: "#7B8996", fontWeight: 700 }}>
                {s.volumeUsd} Vol.
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: "16px", color: s.color, flexShrink: 0 }}>
              {s.pct}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
