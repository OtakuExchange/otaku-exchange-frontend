import Box from "@mui/material/Box";
import type { RowModel } from "../useRowModel";
import { FieldSummary } from "../FieldSummary";
import { TeamBadge } from "../TeamBadge";

export function DesktopOpponentCell({ model }: { model: RowModel }) {
  if (model.isMulti) {
    return (
      <Box
        sx={{
          width: "15%",
          flexShrink: 0,
          mr: 2,
          minWidth: 0,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <FieldSummary opponents={model.topOpponents} totalPools={model.totalPools} />
      </Box>
    );
  }

  if (model.opponent0) {
    const opp = model.opponent0;
    const secondary =
      model.extraOpp > 0
        ? `${opp.entity?.name ?? opp.label} +${model.extraOpp}`
        : (opp.entity?.name ?? opp.label);

    return (
      <Box
        sx={{
          width: "15%",
          flexShrink: 0,
          mr: 2,
          minWidth: 0,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <TeamBadge
          logoPath={opp.entity?.logoPath}
          primary={opp.entity?.abbreviatedName ?? opp.label}
          secondary={secondary}
          align="right"
        />
      </Box>
    );
  }

  return null;
}

