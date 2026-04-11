export const POOL_SEED_AMOUNT = 50000; // must match ParimutuelService.POOL_SEED_AMOUNT

export function calcPayout(
  userStake: number,
  poolVolume: number,
  totalVolume: number,
  multiplier: number = 1,
): number {
  const userPoolTotal = poolVolume - POOL_SEED_AMOUNT;
  if (userPoolTotal <= 0) return 0;
  const basePayout =
    (userStake / userPoolTotal) * (totalVolume - POOL_SEED_AMOUNT);
  const profit = basePayout - userStake;
  return userStake + profit * multiplier;
}

export function calcLegacyPayout(
  userStake: number,
  poolVolume: number,
  totalVolume: number,
  multiplier: number = 1,
): number {
  if (poolVolume <= 0) return 0;
  const basePayout = (userStake / poolVolume) * totalVolume;
  const profit = basePayout - userStake;
  return userStake + profit * multiplier;
}

export function calcLegacyBasePayout(
  userStake: number,
  poolVolume: number,
  totalVolume: number,
): number {
  if (poolVolume <= 0) return 0;
  return (userStake / poolVolume) * totalVolume;
}

export function multiplierColor(multiplier: number): string {
  if (multiplier >= 5) return "#e53935"; // red
  if (multiplier >= 4) return "#e64a19"; // deep orange
  if (multiplier >= 3) return "#f57c00"; // orange
  if (multiplier >= 2) return "#f5a623"; // amber
  return "#f5a623"; // default amber (1x, never shown)
}
