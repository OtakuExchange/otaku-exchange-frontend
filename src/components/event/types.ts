import type { Pool } from "../../models/models";

export type PoolStat = {
  pool: Pool;
  color: string;
  label: string;
  pct: number;
  volumeUsd: string;
};
