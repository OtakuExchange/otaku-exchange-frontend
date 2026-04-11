import { useState } from "react";
import type { Event } from "../../models/models";

export type HistorySortOption =
  | "date_desc"
  | "date_asc"
  | "volume_desc"
  | "volume_asc";

function statusLower(s: string) {
  return s.toLowerCase();
}

export type HistoryMultiplierFilter = "any" | "ge2" | "ge3" | "ge4" | "ge5";

function meetsMultiplierFilter(
  multiplier: number,
  filter: HistoryMultiplierFilter,
) {
  switch (filter) {
    case "any":
      return true;
    case "ge2":
      return multiplier >= 2;
    case "ge3":
      return multiplier >= 3;
    case "ge4":
      return multiplier >= 4;
    case "ge5":
      return multiplier >= 5;
  }
}

function safeTimeMs(iso: string): number {
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function safeNumber(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

export function useHistoryEventFilters() {
  const [sortOption, setSortOption] = useState<HistorySortOption>("date_desc");
  const [multiplierFilter, setMultiplierFilter] =
    useState<HistoryMultiplierFilter>("any");

  function clearFilters() {
    setSortOption("date_desc");
    setMultiplierFilter("any");
  }

  function filter(list: Event[]): Event[] {
    const resolved = list.filter((e) => statusLower(e.status) === "resolved");
    return resolved.filter((e) =>
      meetsMultiplierFilter(safeNumber(e.multiplier), multiplierFilter),
    );
  }

  function sort(
    list: Event[],
    opts?: { volumeByEventId?: Map<Event["id"], number> },
  ): Event[] {
    const volumeByEventId = opts?.volumeByEventId;
    return [...list].sort((a, b) => {
      const aId = a.id;
      const bId = b.id;

      const aVol = safeNumber(volumeByEventId?.get(aId) ?? a.tradeVolume);
      const bVol = safeNumber(volumeByEventId?.get(bId) ?? b.tradeVolume);

      switch (sortOption) {
        case "date_desc": {
          const diff = safeTimeMs(b.closeTime) - safeTimeMs(a.closeTime);
          return diff !== 0 ? diff : bVol - aVol;
        }
        case "date_asc": {
          const diff = safeTimeMs(a.closeTime) - safeTimeMs(b.closeTime);
          return diff !== 0 ? diff : bVol - aVol;
        }
        case "volume_desc": {
          const diff = bVol - aVol;
          return diff !== 0
            ? diff
            : safeTimeMs(b.closeTime) - safeTimeMs(a.closeTime);
        }
        case "volume_asc": {
          const diff = aVol - bVol;
          return diff !== 0
            ? diff
            : safeTimeMs(b.closeTime) - safeTimeMs(a.closeTime);
        }
      }
    });
  }

  function apply(
    list: Event[],
    opts?: { volumeByEventId?: Map<Event["id"], number> },
  ): Event[] {
    return sort(filter(list), opts);
  }

  return {
    sortOption,
    setSortOption,
    multiplierFilter,
    setMultiplierFilter,
    clearFilters,
    filter,
    sort,
    apply,
  };
}
