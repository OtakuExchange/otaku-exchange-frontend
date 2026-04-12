import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { StakePercentBar } from "../../StakePercentBar";
import { OutcomeAmountChip } from "../../OutcomeAmountChip";
import type { PortfolioItem } from "../../../../models/models";
import type { RowModel } from "../useRowModel";
import { EventMultiplierPill } from "../EventMultiplierPill";
import { MobileOpponentCell } from "./MobileOpponentCell";
import { MobileStakeMetaRow } from "./MobileStakeMetaRow";
import { TeamBadge } from "../TeamBadge";

export function MobileStakeRow({
  pool,
  model,
  clickable,
  onClick,
}: {
  pool: PortfolioItem;
  model: RowModel;
  clickable: boolean;
  onClick?: () => void;
}) {
  return (
    <Stack
      onClick={onClick}
      sx={{
        display: { xs: "flex", md: "none" },
        py: 1.5,
        px: 2,
        gap: 1,
        ...(clickable
          ? {
              cursor: "pointer",
              borderRadius: 1,
              "&:hover": { bgcolor: "action.hover" },
            }
          : {}),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ minWidth: 0 }}
      >
        <TeamBadge
          logoPath={pool.entity?.logoPath}
          primary={pool.entity?.abbreviatedName ?? pool.label}
          secondary={pool.entity?.name ?? pool.label}
        />

        <Typography
          variant="caption"
          sx={{ color: "#7B8996", fontWeight: 800, flexShrink: 0 }}
        >
          vs
        </Typography>
        <MobileOpponentCell model={model} />
        <Stack direction="row" spacing={0.75} alignItems="center">
          <EventMultiplierPill multiplier={pool.eventMultiplier} />
          <OutcomeAmountChip
            variant={model.chip.variant}
            amountCents={model.chip.amount}
          />
        </Stack>
      </Stack>
      <Box>
        <StakePercentBar
          leftPct={model.stakedPct}
          leftColor={model.myColor}
          rightColor={model.oppColor}
        />
      </Box>
      <MobileStakeMetaRow pool={pool} model={model} />
    </Stack>
  );
}

