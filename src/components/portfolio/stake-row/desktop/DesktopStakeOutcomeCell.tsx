import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { OutcomeAmountChip } from "../../OutcomeAmountChip";
import type { PortfolioItem } from "../../../../models/models";
import type { RowModel } from "../useRowModel";

function OpenStakeOutcome({ amountCents }: { amountCents: number }) {
  return (
    <Box sx={{ width: 80, textAlign: "center" }}>
      <Typography variant="caption" sx={{ color: "#7B8996", display: "block" }}>
        Payout
      </Typography>
      <OutcomeAmountChip variant="open_payout" amountCents={amountCents} />
    </Box>
  );
}

function ResolvedStakeOutcome({
  pool,
  model,
}: {
  pool: PortfolioItem;
  model: RowModel;
}) {
  return (
    <Box
      sx={{
        width: 80,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {pool.isWinner ? (
        <OutcomeAmountChip
          variant="winner_profit"
          amountCents={model.payout - model.userStake}
        />
      ) : (
        <OutcomeAmountChip
          variant="resolved_loss"
          amountCents={model.userStake}
        />
      )}
    </Box>
  );
}

export function DesktopStakeOutcomeCell({
  pool,
  model,
}: {
  pool: PortfolioItem;
  model: RowModel;
}) {
  if (pool.isWinner || model.isResolved) {
    return <ResolvedStakeOutcome pool={pool} model={model} />;
  }
  return <OpenStakeOutcome amountCents={model.payout} />;
}

