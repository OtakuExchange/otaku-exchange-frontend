import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import type { PortfolioItem } from "../../api";
import { PortfolioStakeRow } from "./PortfolioStakeRow";

export function PortfolioStakeSections({
  items,
  loading,
  maxWidth = 800,
  onRowClick,
}: {
  items: PortfolioItem[];
  loading: boolean;
  maxWidth?: number;
  onRowClick?: (eventId: string, poolId: string) => void;
}) {
  const navigate = useNavigate();

  const grouped = items.reduce<Record<string, PortfolioItem[]>>((acc, item) => {
    (acc[item.eventId] ??= []).push(item);
    return acc;
  }, {});

  const rows = Object.values(grouped).flatMap((group) => {
    const staked = group.filter((p) => p.userStake !== null);
    return staked.map((pool) => {
      const opponents = group.filter((p) => p.id !== pool.id);
      const totalVolume = group.reduce((sum, p) => sum + p.volume, 0);
      return { pool, opponents, totalVolume };
    });
  });

  const currentRows = rows.filter(
    (r) => r.pool.eventStatus.toLowerCase() !== "resolved",
  );
  const closedRows = rows.filter(
    (r) => r.pool.eventStatus.toLowerCase() === "resolved",
  );

  function handleRowClick(eventId: string, poolId: string) {
    if (onRowClick) return onRowClick(eventId, poolId);
    navigate(`/events/${eventId}`, { state: { selectedPoolId: poolId } });
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        Current Bets
      </Typography>
      <Stack divider={<Divider />} sx={{ maxWidth, mb: 4 }}>
        {loading ? (
          [0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={72}
              sx={{ borderRadius: 2, my: 0.5 }}
            />
          ))
        ) : currentRows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No current bets.
          </Typography>
        ) : (
          currentRows.map((row) => (
            <PortfolioStakeRow
              key={row.pool.id}
              pool={row.pool}
              opponents={row.opponents}
              totalVolume={row.totalVolume}
              clickable
              onClick={handleRowClick}
            />
          ))
        )}
      </Stack>

      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        Closed Bets
      </Typography>
      <Stack divider={<Divider />} sx={{ maxWidth }}>
        {loading ? (
          [0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={72}
              sx={{ borderRadius: 2, my: 0.5 }}
            />
          ))
        ) : closedRows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No closed bets.
          </Typography>
        ) : (
          closedRows.map((row) => (
            <PortfolioStakeRow
              key={row.pool.id}
              pool={row.pool}
              opponents={row.opponents}
              totalVolume={row.totalVolume}
              clickable={false}
            />
          ))
        )}
      </Stack>
    </Box>
  );
}
