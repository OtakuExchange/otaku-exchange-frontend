import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import type { StreakStatus } from "../api";
import { useApi } from "../hooks/useApi";
import { useRefreshCash } from "../contexts/RefreshCashContext";

export default function DailyRewardButton() {
  const { fetchDailyStreak, claimDailyReward } = useApi();
  const refreshCash = useRefreshCash();
  const [status, setStatus] = useState<StreakStatus | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);

  useEffect(() => {
    fetchDailyStreak().then(setStatus).catch(console.error);
  }, []);

  async function handleClaim() {
    setClaiming(true);
    try {
      const result = await claimDailyReward();
      setStatus(result);
      setJustClaimed(true);
      refreshCash();
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
    }
  }

  if (!status) return null;

  const rewardDollars = `$${(status.rewardCents / 100).toFixed(0)}`;
  const tooltipText = status.canClaim
    ? `Day ${status.streak + 1} — claim ${rewardDollars}`
    : `Come back tomorrow! 🔥 ${status.streak} day streak`;

  return (
    <Tooltip title={tooltipText}>
      <span>
        <Button
          size="small"
          variant={status.canClaim ? "contained" : "text"}
          onClick={handleClaim}
          disabled={!status.canClaim || claiming}
          startIcon={
            claiming ? (
              <CircularProgress size={14} />
            ) : (
              <EmojiEventsIcon fontSize="small" />
            )
          }
          sx={{
            mr: 2,
            bgcolor: status.canClaim ? "#f5a623" : "transparent",
            color: status.canClaim ? "#000" : "#7B8996",
            fontWeight: 700,
            fontSize: "13px",
            textTransform: "none",
            "&:hover": { bgcolor: status.canClaim ? "#e09510" : "action.hover" },
            "&.Mui-disabled": {
              color: "#7B8996",
            },
          }}
        >
          {claiming
            ? "Claiming..."
            : justClaimed
            ? `+${rewardDollars} claimed!`
            : status.canClaim
            ? `Claim ${rewardDollars}`
            : `🔥 ${status.streak}`}
        </Button>
      </span>
    </Tooltip>
  );
}