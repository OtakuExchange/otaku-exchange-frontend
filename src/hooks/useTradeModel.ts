import { useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useRefreshCash } from "../contexts/RefreshCashContext";
import type { Pool, PayoutPreview } from "../models/models";
import { formatUsdFromCents } from "../utils/formatMoney";
import { useApi } from "./useApi";

export function useTradeModel({
    selectedPool,
    onBuySuccess,
  }: {
    selectedPool: Pool | null;
    onBuySuccess?: () => void;
  }) {
    const { createStake, fetchPayoutPreview } = useApi();
    const refreshCash = useRefreshCash();
    const queryClient = useQueryClient();
  
    const [rawAmount, setRawAmount] = useState("");
    const [buying, setBuying] = useState(false);
    const [payoutPreview, setPayoutPreview] = useState<PayoutPreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toast, setToast] = useState<{
      message: string;
      severity: "success" | "error";
    } | null>(null);
  
    const amountCents = useMemo(() => {
      if (!rawAmount) return 0;
      const n = parseInt(rawAmount, 10);
      return Number.isFinite(n) ? n : 0;
    }, [rawAmount]);
  
    useEffect(() => {
      const eventId = selectedPool?.eventId;
      const poolId = selectedPool?.id;
      if (!eventId || !poolId || amountCents <= 0) {
        setPayoutPreview(null);
        setPreviewLoading(false);
        return;
      }
  
      let cancelled = false;
      setPreviewLoading(true);
      const timer = setTimeout(() => {
        fetchPayoutPreview(eventId, poolId, amountCents)
          .then((preview) => {
            if (cancelled) return;
            setPayoutPreview(preview);
          })
          .catch(() => {
            if (cancelled) return;
            setPayoutPreview(null);
          })
          .finally(() => {
            if (cancelled) return;
            setPreviewLoading(false);
          });
      }, 250);
  
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }, [selectedPool?.eventId, selectedPool?.id, amountCents, fetchPayoutPreview]);
  
    function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
      const digits = e.target.value.replace(/\D/g, "");
      setRawAmount(digits);
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
      previewLoading,
      toastOpen,
      toast,
      setToastOpen,
      handleAmountChange,
      handleBuy,
    };
  }