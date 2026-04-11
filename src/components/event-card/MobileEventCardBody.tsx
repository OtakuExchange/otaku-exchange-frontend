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
  highlightWinnerPool = false,
}: {
  pools: Pool[];
  totalVolume: number;
  isMulti: boolean;
  onSelectPool: (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
    poolId: string,
  ) => void;
  highlightWinnerPool?: boolean;
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
        const isWinner = highlightWinnerPool && pool.isWinner;
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
              border: "1px solid",
              borderColor: isWinner ? "success.main" : "transparent",
              boxShadow: isWinner
                ? "0 0 0 1px rgba(61, 180, 104, 0.25)"
                : undefined,
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
