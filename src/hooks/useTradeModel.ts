import { useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useRefreshCash } from "../contexts/RefreshCashContext";
import type { Pool, PayoutPreview } from "../models/models";
import { formatUsdFromCents } from "../utils/formatMoney";
import { calcLegacyPayout } from "../utils/parimutuel";
import { useApi } from "./useApi";

export function useTradeModel({
  selectedPool,
  totalVolume,
  onBuySuccess,
  isFirstStakeBonusEligible,
}: {
  selectedPool: Pool | null;
  totalVolume: number;
  onBuySuccess?: () => void;
  isFirstStakeBonusEligible?: boolean;
}) {
  const { createStake, fetchCurrentUser } = useApi();
  const refreshCash = useRefreshCash();
  const queryClient = useQueryClient();

  const [rawAmount, setRawAmount] = useState("");
  const [buying, setBuying] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  
  const [toast, setToast] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then((currentUser) => {
        if (!currentUser) return;
        setUserBalance(currentUser.balance - currentUser.lockedBalance);
      })
      .catch(console.error);
  }, [fetchCurrentUser]);

  const amountCents = useMemo(() => {
    if (!rawAmount) return 0;
    const n = parseInt(rawAmount, 10);
    return Number.isFinite(n) ? n : 0;
  }, [rawAmount]);

  const bonusCents = useMemo(() => {
    const eligible = Boolean(isFirstStakeBonusEligible);
    return eligible ? Math.min(amountCents, 50_000) : 0;
  }, [amountCents, isFirstStakeBonusEligible]);

  const effectiveStakeCents = amountCents + bonusCents;

  const payoutPreview = useMemo<PayoutPreview | null>(() => {
    if (!selectedPool || effectiveStakeCents <= 0 || totalVolume <= 0) return null;
    const nextPoolVolume = selectedPool.volume + effectiveStakeCents;
    const nextTotalVolume = totalVolume + effectiveStakeCents;
    const projectedPayout = calcLegacyPayout(
      effectiveStakeCents,
      nextPoolVolume,
      nextTotalVolume,
    );
    return {
      hypotheticalStake: effectiveStakeCents,
      projectedPayout,
    };
  }, [selectedPool, effectiveStakeCents, totalVolume]);

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
      await createStake(selectedPool.id, stakeCents);
      const label = selectedPool.entity?.name ?? selectedPool.label;
      setToast({
        message: `Bought ${formatUsdFromCents(stakeCents)} stake in ${label}`,
        severity: "success",
      });
      setToastOpen(true);
      refreshCash();
      queryClient.invalidateQueries({ queryKey: ["portfolio", "me"] });
      onBuySuccess?.();
      setRawAmount("");
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to place order", severity: "error" });
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
    previewLoading: false,
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
