import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PortfolioItem } from "../api";
import { usePortfolioQuery } from "../hooks/queries/usePortfolioQuery";
import { calcPayout, calcLegacyPayout } from "../utils/parimutuel";

function formatCents(cents: number): string {
  const d = cents / 100;
  if (d < 1000) return d.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const k = d / 1000;
  if (k < 10) return `$${k.toFixed(3)}K`;
  if (k < 100) return `$${k.toFixed(2)}K`;
  return `$${k.toFixed(1)}K`;
}

export default function PortfolioView() {
  const { data, isLoading: loading } = usePortfolioQuery();
  const navigate = useNavigate();
  const items = data?.pools ?? [];

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

  const currentRows = rows.filter((r) => r.pool.eventStatus.toLowerCase() !== "resolved");
  const closedRows  = rows.filter((r) => r.pool.eventStatus.toLowerCase() === "resolved");

  function renderRow({ pool, opponents, totalVolume }: typeof rows[0], clickable: boolean) {
    const myColor   = pool.entity?.color ?? "#1565c0";
    const stakedPct = totalVolume > 0 ? (pool.volume / totalVolume) * 100 : 50;
    const oppPct    = 100 - stakedPct;
    const oppColor  = "#3d4550";
    const userStake = pool.userStake ?? 0;
    const LEGACY_CUTOFF = new Date("2026-04-01");
    const payout = new Date(pool.createdAt) < LEGACY_CUTOFF
      ? calcLegacyPayout(userStake, pool.volume, totalVolume)
      : calcPayout(userStake, pool.volume, totalVolume, pool.eventMultiplier);

    return (
      <Stack
        key={pool.id}
        direction="row"
        alignItems="center"
        onClick={clickable ? () => navigate(`/events/${pool.eventId}`) : undefined}
        sx={{ py: 2, px: "20px", gap: 0, ...(clickable ? { cursor: "pointer", borderRadius: 1, "&:hover": { bgcolor: "action.hover" } } : {}) }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: "15%", flexShrink: 0, minWidth: 0 }}>
          {pool.entity?.logoPath && (
            <Box component="img" src={pool.entity.logoPath} sx={{ width: 40, height: 40, borderRadius: 0.5, flexShrink: 0 }} />
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {pool.entity?.abbreviatedName ?? pool.label}
            </Typography>
            <Typography variant="caption" sx={{ color: "#7B8996", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
              {pool.entity?.name ?? pool.label}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="body2" fontWeight={700} sx={{ color: myColor, flexShrink: 0, minWidth: 40, textAlign: "right", mr: 1, fontSize: "0.875rem" }}>
          {Math.round(stakedPct)}%
        </Typography>
        <Box sx={{ width: "40%", flexShrink: 0, display: "flex", alignItems: "center", height: 32, mr: 2 }}>
          <Box sx={{ width: `${stakedPct}%`, height: 16, bgcolor: myColor, borderRadius: "4px 0 0 4px" }} />
          <Box sx={{ width: `${oppPct}%`, height: 8, bgcolor: oppColor, borderRadius: "0 4px 4px 0" }} />
        </Box>

        {opponents[0] && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: "15%", flexShrink: 0, mr: 2, justifyContent: "flex-end" }}>
            <Box sx={{ textAlign: "right", minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {opponents[0].entity?.abbreviatedName ?? opponents[0].label}
              </Typography>
              <Typography variant="caption" sx={{ color: "#7B8996", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                {opponents[0].entity?.name ?? opponents[0].label}
              </Typography>
            </Box>
            {opponents[0].entity?.logoPath && (
              <Box component="img" src={opponents[0].entity.logoPath} sx={{ width: 40, height: 40, borderRadius: 0.5, flexShrink: 0 }} />
            )}
          </Stack>
        )}

        <Stack direction="row" sx={{ ml: "auto", flexShrink: 0 }}>
          <Box sx={{ width: 80, textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "#7B8996", display: "block" }}>Stake</Typography>
            <Typography variant="body2" fontWeight={600}>
              {(userStake / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </Typography>
          </Box>
          <Box sx={{ width: 80, textAlign: "center" }}>
            {pool.isWinner ? (
              <Box sx={{ bgcolor: "#3DB468", borderRadius: 1, px: 1, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: "#16191d", fontSize: "13px" }}>
                  +{formatCents(payout - userStake)}
                </Typography>
              </Box>
            ) : pool.eventStatus.toLowerCase() === "resolved" ? (
              <Box sx={{ bgcolor: "#AC3031", borderRadius: 1, px: 1, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: "#16191d", fontSize: "13px" }}>
                  -{formatCents(userStake)}
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="caption" sx={{ color: "#7B8996", display: "block" }}>Payout</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: "#3DB468" }}>
                  {(payout / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </Typography>
              </>
            )}
          </Box>
        </Stack>
      </Stack>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Portfolio</Typography>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Current Stakes</Typography>
      <Stack divider={<Divider />} sx={{ maxWidth: 800, mb: 4 }}>
        {loading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 2, my: 0.5 }} />)
        ) : currentRows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No current stakes.</Typography>
        ) : (
          currentRows.map((row) => renderRow(row, true))
        )}
      </Stack>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Closed Stakes</Typography>
      <Stack divider={<Divider />} sx={{ maxWidth: 800 }}>
        {loading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 2, my: 0.5 }} />)
        ) : closedRows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No closed stakes.</Typography>
        ) : (
          closedRows.map((row) => renderRow(row, false))
        )}
      </Stack>
    </Box>
  );
}