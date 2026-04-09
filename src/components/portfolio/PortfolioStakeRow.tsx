import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PortfolioItem } from "../../api";
import { calcLegacyPayout, calcPayout } from "../../utils/parimutuel";
import { formatCentsCompact } from "../../utils/formatMoney";
import { StakePercentBar } from "./StakePercentBar";
import { OutcomeAmountChip } from "./OutcomeAmountChip";

type ChipVariant = "winner_profit" | "resolved_loss" | "open_payout";

type RowModel = {
  myColor: string;
  oppColor: string;
  stakedPct: number;
  userStake: number;
  payout: number;
  isResolved: boolean;
  chip: { variant: ChipVariant; amount: number };
  opponent0?: PortfolioItem;
  extraOpp: number;
};

function TeamBadge({
  logoPath,
  primary,
  secondary,
  align = "left",
}: {
  logoPath?: string | null;
  primary: string;
  secondary?: string | null;
  align?: "left" | "right";
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
      {logoPath ? (
        <Box
          component="img"
          src={logoPath}
          sx={{ width: 32, height: 32, borderRadius: 0.5, flexShrink: 0 }}
        />
      ) : (
        <Box sx={{ width: 32, height: 32, flexShrink: 0 }} />
      )}
      <Box sx={{ minWidth: 0, textAlign: align }}>
        <Typography
          variant="body2"
          fontWeight={800}
          sx={{
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {primary}
        </Typography>
        {secondary && (
          <Typography
            variant="caption"
            sx={{
              color: "#7B8996",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
          >
            {secondary}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function computeRowModel({
  pool,
  opponents,
  totalVolume,
}: {
  pool: PortfolioItem;
  opponents: PortfolioItem[];
  totalVolume: number;
}): RowModel {
  const myColor = pool.entity?.color ?? "#1565c0";
  const stakedPct = totalVolume > 0 ? (pool.volume / totalVolume) * 100 : 50;
  const oppColor = "#3d4550";
  const userStake = pool.userStake ?? 0;

  const LEGACY_CUTOFF = new Date("2026-04-01");
  const BACK_TO_LEGACY = new Date("2024-04-08");

  const isLegacy =
    new Date(pool.createdAt) < LEGACY_CUTOFF &&
    new Date(pool.createdAt) >= BACK_TO_LEGACY;

  const payout = isLegacy
    ? calcLegacyPayout(userStake, pool.volume, totalVolume)
    : calcPayout(userStake, pool.volume, totalVolume, pool.eventMultiplier);

  const isResolved = pool.eventStatus.toLowerCase() === "resolved";
  const chip = (() => {
    if (pool.isWinner)
      return { variant: "winner_profit" as const, amount: payout - userStake };
    if (isResolved)
      return { variant: "resolved_loss" as const, amount: userStake };
    return { variant: "open_payout" as const, amount: payout };
  })();

  const opponent0 = opponents[0];
  const extraOpp = Math.max(0, opponents.length - 1);

  return {
    myColor,
    oppColor,
    stakedPct,
    userStake,
    payout,
    isResolved,
    chip,
    opponent0,
    extraOpp,
  };
}

function MobileStakeRow({
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

        {model.opponent0 ? (
          <Box
            sx={{
              minWidth: 0,
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <TeamBadge
              logoPath={model.opponent0.entity?.logoPath}
              primary={
                model.opponent0.entity?.abbreviatedName ?? model.opponent0.label
              }
              secondary={
                model.extraOpp > 0
                  ? `${model.opponent0.entity?.name ?? model.opponent0.label} +${model.extraOpp}`
                  : (model.opponent0.entity?.name ?? model.opponent0.label)
              }
              align="right"
            />
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1 }} />
        )}

        <OutcomeAmountChip
          variant={model.chip.variant}
          amountCents={model.chip.amount}
        />
      </Stack>

      <StakePercentBar
        leftPct={model.stakedPct}
        leftColor={model.myColor}
        rightColor={model.oppColor}
      />

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
    </Stack>
  );
}

function DesktopStakeRow({
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

      <Box sx={{ width: "40%", flexShrink: 0, mr: 2 }}>
        <StakePercentBar
          leftPct={model.stakedPct}
          leftColor={model.myColor}
          rightColor={model.oppColor}
        />
      </Box>

      {model.opponent0 && (
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
            logoPath={model.opponent0.entity?.logoPath}
            primary={
              model.opponent0.entity?.abbreviatedName ?? model.opponent0.label
            }
            secondary={
              model.extraOpp > 0
                ? `${model.opponent0.entity?.name ?? model.opponent0.label} +${model.extraOpp}`
                : (model.opponent0.entity?.name ?? model.opponent0.label)
            }
            align="right"
          />
        </Box>
      )}

      <Stack direction="row" sx={{ ml: "auto", flexShrink: 0 }}>
        <Box sx={{ width: 80, textAlign: "center" }}>
          <Typography
            variant="caption"
            sx={{ color: "#7B8996", display: "block" }}
          >
            Stake
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {(model.userStake / 100).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </Typography>
        </Box>
        {pool.isWinner ? (
          <ResolvedStakeOutcome pool={pool} model={model} />
        ) : model.isResolved ? (
          <ResolvedStakeOutcome pool={pool} model={model} />
        ) : (
          <OpenStakeOutcome amountCents={model.payout} />
        )}
      </Stack>
    </Stack>
  );
}

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
  const model = computeRowModel({ pool, opponents, totalVolume });
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
