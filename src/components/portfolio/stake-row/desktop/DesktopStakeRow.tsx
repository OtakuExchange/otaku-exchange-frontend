import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PortfolioItem } from "../../../../models/models";
import type { RowModel } from "../useRowModel";
import { DesktopOpponentCell } from "./DesktopOpponentCell";
import { DesktopStakeBar } from "./DesktopStakeBar";
import { DesktopStakeOutcomeCell } from "./DesktopStakeOutcomeCell";
import { EventMultiplierPill } from "../EventMultiplierPill";
import { TeamBadge } from "../TeamBadge";

function DesktopStakeAmountCell({
  userStake,
  multiplier,
}: {
  userStake: number;
  multiplier: number;
}) {
  return (
    <Box sx={{ width: 80, textAlign: "center" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={0.5}
        sx={{ color: "#7B8996" }}
      >
        <Typography variant="caption" sx={{ color: "#7B8996" }}>
          Stake
        </Typography>
        <EventMultiplierPill multiplier={multiplier} />
      </Stack>
      <Typography variant="body2" fontWeight={600}>
        {(userStake / 100).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </Typography>
    </Box>
  );
}

export function DesktopStakeRow({
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
      direction="row"
      alignItems="center"
      onClick={onClick}
      sx={{
        display: { xs: "none", md: "flex" },
        py: 2,
        px: "20px",
        gap: 0,
        ...(clickable
          ? {
              cursor: "pointer",
              borderRadius: 1,
              "&:hover": { bgcolor: "action.hover" },
            }
          : {}),
      }}
    >
      <Box sx={{ width: "15%", flexShrink: 0, minWidth: 0 }}>
        <TeamBadge
          logoPath={pool.entity?.logoPath}
          primary={pool.entity?.abbreviatedName ?? pool.label}
          secondary={pool.entity?.name ?? pool.label}
        />
      </Box>

      <Typography
        variant="body2"
        fontWeight={700}
        sx={{
          color: model.myColor,
          flexShrink: 0,
          minWidth: 40,
          textAlign: "right",
          mr: 1,
          fontSize: "0.875rem",
        }}
      >
        {Math.round(model.stakedPct)}%
      </Typography>
      <DesktopStakeBar model={model} />
      <DesktopOpponentCell model={model} />
      <Stack direction="row" sx={{ ml: "auto", flexShrink: 0 }}>
        <DesktopStakeAmountCell
          userStake={model.userStake}
          multiplier={pool.eventMultiplier}
        />
        <DesktopStakeOutcomeCell pool={pool} model={model} />
      </Stack>
    </Stack>
  );
}

