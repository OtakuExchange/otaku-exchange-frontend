import { useState, useMemo, useEffect } from "react";
import type { Pool } from "../models/models";
import { formatUsdFromCents } from "../utils/formatMoney";
import { calcLegacyBasePayout, calcLegacyPayout } from "../utils/parimutuel";
import { useUserQuery } from "../api/user/user.queries";
import { FIRST_BET_BONUS_STAKE_CENTS } from "../models/models";
import { useStakeMutation } from "../api/events/events.mutations";

export function useTradeModel({
  eventMultiplier,
  selectedPool,
  totalVolume,
  onBuySuccess,
  isFirstStakeBonusEligible,
}: {
  eventMultiplier: number;
  selectedPool: Pool | null;
  totalVolume: number;
  onBuySuccess?: () => void;
  isFirstStakeBonusEligible?: boolean;
}) {
  const { data: user } = useUserQuery();
  const { createStake } = useStakeMutation();
  const [rawAmount, setRawAmount] = useState("");
  const [buying, setBuying] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    setUserBalance(user.balance - user.lockedBalance);
  }, [user]);

  const amountCents = useMemo(() => {
    if (!rawAmount) return 0;
    const n = parseInt(rawAmount, 10);
    return Number.isFinite(n) ? n : 0;
  }, [rawAmount]);

  const bonusCents = useMemo(() => {
    const eligible = Boolean(isFirstStakeBonusEligible);
    return eligible ? Math.min(amountCents, FIRST_BET_BONUS_STAKE_CENTS) : 0;
  }, [amountCents, isFirstStakeBonusEligible]);

  const effectiveStakeCents = amountCents + bonusCents;

  const { payoutPreview, baseProfitCents } = useMemo(() => {
    if (!selectedPool || effectiveStakeCents <= 0 || totalVolume <= 0) {
      return { payoutPreview: null, baseProfitCents: null };
    }

    const nextPoolVolume = selectedPool.volume + effectiveStakeCents;
    const nextTotalVolume = totalVolume + effectiveStakeCents;

    const baseProfitCents =
      calcLegacyBasePayout(
        effectiveStakeCents,
        nextPoolVolume,
        nextTotalVolume,
      ) - effectiveStakeCents;

    const projectedPayout = calcLegacyPayout(
      effectiveStakeCents,
      nextPoolVolume,
      nextTotalVolume,
      eventMultiplier,
    );
    const payoutPreview = {
      hypotheticalStake: effectiveStakeCents,
      projectedPayout,
    };

    return { payoutPreview, baseProfitCents };
  }, [selectedPool, effectiveStakeCents, totalVolume, eventMultiplier]);

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setRawAmount(digits);
  }

  function setAmountCents(next: number) {
    const safe = Number.isFinite(next) ? Math.max(0, Math.floor(next)) : 0;
    setRawAmount(safe > 0 ? String(safe) : "");
  }

  const displayAmount = amountCents > 0 ? formatUsdFromCents(amountCents) : "";

  async function handleBuy() {
    if (!selectedPool) return;
    const stakeCents = parseInt(rawAmount, 10);
    if (!Number.isFinite(stakeCents) || stakeCents <= 0) return;

    setBuying(true);
    try {
      await createStake({ marketPoolId: selectedPool.id, amount: stakeCents });
      const label = selectedPool.entity?.name ?? selectedPool.label;
      setToast({
        message: `Bought ${formatUsdFromCents(stakeCents)} stake in ${label}`,
        severity: "success",
      });
      setToastOpen(true);
      onBuySuccess?.();
      setRawAmount("");
    } catch (e) {
      console.error(e);
      const message = e?.response?.data ?? e?.message ?? "Failed to place order";
      setToast({ message, severity: "error" });
      setToastOpen(true);
    } finally {
      setBuying(false);
    }
  }

  return {
    rawAmount,
    amountCents,
    displayAmount,
    buying,
    payoutPreview,
    baseProfitCents,
    bonusCents,
    effectiveStakeCents,
    toastOpen,
    toast,
    userBalance,
    setToastOpen,
    handleAmountChange,
    setAmountCents,
    handleBuy,
  };
}
