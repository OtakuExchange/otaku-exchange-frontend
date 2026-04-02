export const POOL_SEED_AMOUNT = 50000; // must match ParimutuelService.POOL_SEED_AMOUNT

export function calcPayout(userStake: number, poolVolume: number, totalVolume: number): number {
  if (poolVolume <= 0) return 0;
  const shareOfPool = userStake / (poolVolume - POOL_SEED_AMOUNT);
  return shareOfPool * (totalVolume - POOL_SEED_AMOUNT);
}

export function calcLegacyPayout(userStake: number, poolVolume: number, totalVolume: number): number {
  if (poolVolume <= 0) return 0;
  const shareOfPool = userStake / (poolVolume);
  return shareOfPool * (totalVolume);
}

export function calcPreviewPayout(hypotheticalAmount: number, currentPoolTotal: number, currentGrandTotal: number): number {
  const newPoolTotal  = currentPoolTotal + hypotheticalAmount;
  const newGrandTotal = currentGrandTotal + hypotheticalAmount;
  if (newPoolTotal === 0) return hypotheticalAmount;
  return calcPayout(hypotheticalAmount, newPoolTotal, newGrandTotal);
}