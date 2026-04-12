import type { PortfolioItem } from "../../../models/models";
import { calcLegacyPayout, calcPayout } from "../../../utils/parimutuel";
import type { PercentSegment } from "../MultiStakePercentBar";

type ChipVariant = "winner_profit" | "resolved_loss" | "open_payout";

export type RowModel = {
  myColor: string;
  oppColor: string;
  stakedPct: number;
  userStake: number;
  payout: number;
  isResolved: boolean;
  chip: { variant: ChipVariant; amount: number };
  opponent0?: PortfolioItem;
  extraOpp: number;
  isMulti: boolean;
  totalPools: number;
  topOpponents: PortfolioItem[];
  segments: PercentSegment[];
};

export function useRowModel({
  pool,
  opponents,
  totalVolume,
}: {
  pool: PortfolioItem;
  opponents: PortfolioItem[];
  totalVolume: number;
}): RowModel {
  const myColor = pool.entity?.color ?? "#1565c0";
  const stakedPct = totalVolume > 0 ? (pool.volume / totalVolume) * 100 : 50;
  const oppColor = "#3d4550";
  const userStake = pool.userStake ?? 0;

  const LEGACY_CUTOFF = new Date("2026-04-01");
  const BACK_TO_LEGACY = new Date("2024-04-08");

  const isLegacy =
    new Date(pool.createdAt) < LEGACY_CUTOFF ||
    new Date(pool.createdAt) >= BACK_TO_LEGACY;

  const payout = isLegacy
    ? calcLegacyPayout(
        userStake,
        pool.volume,
        totalVolume,
        pool.eventMultiplier,
      )
    : calcPayout(userStake, pool.volume, totalVolume, pool.eventMultiplier);

  const isResolved = pool.eventStatus.toLowerCase() === "resolved";
  const chip = (() => {
    if (pool.isWinner)
      return { variant: "winner_profit" as const, amount: payout - userStake };
    if (isResolved)
      return { variant: "resolved_loss" as const, amount: userStake };
    return { variant: "open_payout" as const, amount: payout };
  })();

  const opponent0 = opponents[0];
  const extraOpp = Math.max(0, opponents.length - 1);

  const isMulti = opponents.length >= 2;
  const totalPools = opponents.length + 1;
  const topOpponents = [...opponents]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 3);
  const palette = ["#55606b", "#7B8996", "#3d4550"];
  const segments: PercentSegment[] = isMulti
    ? (() => {
        const mePct = totalVolume > 0 ? (pool.volume / totalVolume) * 100 : 0;
        const topSegs = topOpponents.map((p, idx) => ({
          key: p.id,
          pct: totalVolume > 0 ? (p.volume / totalVolume) * 100 : 0,
          color: p.entity?.color ?? palette[idx % palette.length],
        }));
        const used = mePct + topSegs.reduce((s, seg) => s + seg.pct, 0);
        const otherPct = Math.max(0, 100 - used);
        return [
          { key: pool.id, pct: mePct, color: myColor },
          ...topSegs,
          { key: "other", pct: otherPct, color: oppColor },
        ];
      })()
    : [];

  return {
    myColor,
    oppColor,
    stakedPct,
    userStake,
    payout,
    isResolved,
    chip,
    opponent0,
    extraOpp,
    isMulti,
    totalPools,
    topOpponents,
    segments,
  };
}
