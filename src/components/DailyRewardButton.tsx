import { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useClaimDailyMutation } from "../api/reward/reward.mutations";
import { useDailyStreakQuery } from "../api/reward/reward.queries";

export default function DailyRewardButton({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const { data: status } = useDailyStreakQuery();
  const { claimDailyReward } = useClaimDailyMutation();
  const [claiming, setClaiming] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);
  const [claimedAmt, setClaimedAmt] = useState(0);

  async function handleClaim() {
    setClaiming(true);
    try {
      const status = await claimDailyReward();
      setClaimedAmt(status.rewardCents)
      setJustClaimed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
    }
  }

  const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const total = status?.rewardCents ?? 0;

  const buttonLabel = (() => {
    if (!status) return "…";
    if (claiming) return "Claiming...";
    if (justClaimed) return `+${fmt(claimedAmt)} claimed!`;
    if (!status.canClaim) return `🔥 ${status.streak}`;
    return `Claim ${fmt(total)}`;
  })();

  const tooltipText = useMemo(() => {
    if (!status) {
      return "Loading daily reward…"
    }

    if (!status.canClaim) {
      return `Come back tomorrow! 🔥 ${status.streak} day streak`;
    }

    return `Day ${status.streak + 1} — claim ${fmt(total)}`
  }, [status, total])

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
              ? "#7b1fa2"
              : "transparent",
            color: status?.canClaim ? "#fff" : "#7B8996",
            fontWeight: 700,
            fontSize: "13px",
            textTransform: "none",
            "&:hover": {
              bgcolor: status?.canClaim
                ? "#6a1b9a"
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
