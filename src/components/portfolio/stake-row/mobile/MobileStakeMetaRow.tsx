import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatCentsCompact } from "../../../../utils/formatMoney";
import type { PortfolioItem } from "../../../../models/models";
import type { RowModel } from "../useRowModel";

export function MobileStakeMetaRow({
  pool,
  model,
}: {
  pool: PortfolioItem;
  model: RowModel;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{ color: "#7B8996" }}
    >
      <Typography variant="caption" fontWeight={700}>
        Stake {formatCentsCompact(model.userStake)}
      </Typography>
      <Typography variant="caption" fontWeight={700}>
        {model.isResolved
          ? pool.isWinner
            ? `Win ${formatCentsCompact(model.payout)}`
            : "Resolved"
          : `Payout ${formatCentsCompact(model.payout)}`}
      </Typography>
    </Stack>
  );
}

