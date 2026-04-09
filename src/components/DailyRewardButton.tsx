import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import type { StreakStatus } from "../api/api";
import { useApi } from "../hooks/useApi";
import { useClaimDailyMutation } from "../hooks/mutations/claimDailyMutation";

export default function DailyRewardButton({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const { fetchDailyStreak } = useApi();
  const { claimDailyReward } = useClaimDailyMutation();
  const [status, setStatus] = useState<StreakStatus | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);

  useEffect(() => {
    fetchDailyStreak().then(setStatus).catch(console.error);
  }, [fetchDailyStreak]);

  async function handleClaim() {
    setClaiming(true);
    try {
      const result = await claimDailyReward();
      setStatus(result);
      setJustClaimed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
    }
  }

  const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const base = status?.rewardCents ?? 0;
  const bonus = status?.comebackBonusCents ?? 0;
  const total = base + bonus;
  const hasBonus = bonus > 0;

  const buttonLabel = (() => {
    if (!status) return "…";
    if (claiming) return "Claiming...";
    if (justClaimed) return `+${fmt(total)} claimed!`;
    if (!status.canClaim) return `🔥 ${status.streak}`;
    if (hasBonus) return `Claim ${fmt(base)} + ${fmt(bonus)} boost`;
    return `Claim ${fmt(base)}`;
  })();

  const tooltipText = !status
    ? "Loading daily reward…"
    : status.canClaim
      ? hasBonus
        ? `Day ${status.streak + 1} streak — ${fmt(base)} base + ${fmt(bonus)} comeback bonus (20% of gap to #1)`
        : `Day ${status.streak + 1} — claim ${fmt(base)}`
      : `Come back tomorrow! 🔥 ${status.streak} day streak`;

  const mobileLabel = (() => {
    if (!status) return "";
    if (claiming) return "";
    if (justClaimed) return `+${fmt(total)}`;
    if (!status.canClaim) return `🔥${status.streak}`;
    return `+${fmt(total)}`;
  })();

  return (
    <Tooltip title={tooltipText}>
      <span>
        <Button
          size="small"
          variant={status?.canClaim ? "contained" : "text"}
          onClick={handleClaim}
          disabled={!status?.canClaim || claiming}
          startIcon={
            claiming ? (
              <CircularProgress size={14} />
            ) : (
              <EmojiEventsIcon fontSize="small" />
            )
          }
          sx={{
            mr: variant === "desktop" ? 2 : 1,
            minWidth: variant === "mobile" ? 36 : undefined,
            px: variant === "mobile" ? 1.25 : undefined,
            bgcolor: status?.canClaim
              ? hasBonus
                ? "#7b1fa2"
                : "#f5a623"
              : "transparent",
            color: status?.canClaim ? "#fff" : "#7B8996",
            fontWeight: 700,
            fontSize: "13px",
            textTransform: "none",
            "&:hover": {
              bgcolor: status?.canClaim
                ? hasBonus
                  ? "#6a1b9a"
                  : "#e09510"
                : "action.hover",
            },
            "&.Mui-disabled": {
              color: "#7B8996",
            },
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {variant === "mobile" ? mobileLabel : buttonLabel}
        </Button>
      </span>
    </Tooltip>
  );
}
