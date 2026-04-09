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

export function MobileEventCardBody({
  pools,
  totalVolume,
  isMulti,
  onSelectPool,
}: {
  pools: Pool[];
  totalVolume: number;
  isMulti: boolean;
  onSelectPool: (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>, poolId: string) => void;
}) {
  return (
    <Stack
      spacing={1}
      sx={{ display: { xs: "flex", md: "none" }, ...(isMulti && scrollableSx) }}
    >
      {pools.map((pool) => {
        const pct =
          totalVolume > 0 ? Math.round((pool.volume / totalVolume) * 100) : 0;
        const color = pool.entity?.color ?? "#1565c0";
        return (
          <Button
            key={pool.id}
            size="medium"
            variant="contained"
            fullWidth
            sx={{
              justifyContent: "space-between",
              py: 1,
              borderRadius: 2,
              fontWeight: 800,
              bgcolor: color + "26",
              color: entityTextColor(color),
              "&:hover": { bgcolor: color + "40" },
              textTransform: "none",
            }}
            onClick={(e) => onSelectPool(e, pool.id)}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {pool.entity?.logoPath ? (
                <Box
                  component="img"
                  src={pool.entity.logoPath}
                  sx={{ width: 24, height: 24, borderRadius: 0.5 }}
                />
              ) : (
                <Box sx={{ width: 24, height: 24 }} />
              )}
              <Typography sx={{ fontWeight: 800 }}>
                {pool.entity?.abbreviatedName ?? pool.label}
              </Typography>
            </Stack>
            <Typography sx={{ fontWeight: 800, color: "#7B8996" }}>
              {pct}%
            </Typography>
          </Button>
        );
      })}
    </Stack>
  );
}
