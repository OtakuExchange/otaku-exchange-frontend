import type { PortfolioItem } from "../../../models/models";
import { useRowModel } from "./useRowModel";
import { DesktopStakeRow } from "./desktop/DesktopStakeRow";
import { MobileStakeRow } from "./mobile/MobileStakeRow";

export function PortfolioStakeRow({
  pool,
  opponents,
  totalVolume,
  clickable,
  onClick,
}: {
  pool: PortfolioItem;
  opponents: PortfolioItem[];
  totalVolume: number;
  clickable: boolean;
  onClick?: (eventId: string, poolId: string) => void;
}) {
  const model = useRowModel({ pool, opponents, totalVolume });
  const handleClick = clickable
    ? () => onClick?.(pool.eventId, pool.id)
    : undefined;

  return (
    <>
      <MobileStakeRow
        pool={pool}
        model={model}
        clickable={clickable}
        onClick={handleClick}
      />
      <DesktopStakeRow
        pool={pool}
        model={model}
        clickable={clickable}
        onClick={handleClick}
      />
    </>
  );
}
