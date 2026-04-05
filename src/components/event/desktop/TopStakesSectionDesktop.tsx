import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { EventStake } from "../../../api";
import type { Pool } from "../../../models/models";

export function TopStakesSectionDesktop({
  pools,
  eventStakes,
}: {
  pools: Pool[];
  eventStakes: EventStake[];
}) {
  const grouped = eventStakes.reduce<Record<string, typeof eventStakes>>(
    (acc, s) => {
      (acc[s.marketPoolId] ??= []).push(s);
      return acc;
    },
    {},
  );
  const sortedGroups = Object.values(grouped).sort((a, b) => {
    const aIdx = pools.findIndex((p) => p.id === a[0].marketPoolId);
    const bIdx = pools.findIndex((p) => p.id === b[0].marketPoolId);
    return aIdx - bIdx;
  });

  return (
    <Stack
      direction="row"
      spacing={4}
      sx={{ display: { xs: "none", md: "flex" } }}
    >
      {sortedGroups.map((group) => (
        <Box key={group[0].marketPoolId} sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: "#7B8996", mb: 0.5, display: "block" }}
          >
            {group[0].poolLabel}
          </Typography>
          <Stack spacing={1}>
            {group.map((stake) => (
              <Stack
                key={stake.id}
                direction="row"
                alignItems="center"
                spacing={1.5}
              >
                <Avatar
                  src={stake.avatarUrl ?? undefined}
                  sx={{ width: 28, height: 28, fontSize: 13 }}
                >
                  {stake.username[0].toUpperCase()}
                </Avatar>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ flexGrow: 1 }}
                >
                  {stake.username}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {(stake.amount / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
