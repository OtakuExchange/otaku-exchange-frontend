import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useLeaderboardQuery } from "../api/rank/rank.queries";
import type { LeaderboardEntry } from "../models/models";

const LeaderboardLoadingSkeleton = () =>
  [0, 1, 2, 3, 4].map((i) => (
    <Stack
      key={i}
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ py: 1.5 }}
    >
      <Skeleton variant="circular" width={36} height={36} />
      <Skeleton variant="text" width={120} />
      <Box sx={{ flexGrow: 1 }} />
      <Skeleton variant="text" width={60} />
    </Stack>
  ));

const LeaderboardError = ({ error }: { error: Error }) => (
  <Typography variant="body1" color="error">
    Error loading leaderboard: {error.message}
  </Typography>
);

const LeaderboardRow = ({ entry }: { entry: LeaderboardEntry }) => {
  const navigate = useNavigate();
  return (
    <Stack
      key={entry.userId}
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        py: 1.5,
        px: "20px",
        cursor: "pointer",
        borderRadius: 1,
        "&:hover": { bgcolor: "action.hover" },
      }}
      onClick={() =>
        navigate(`/users/${entry.userId}`, {
          state: {
            username: entry.username,
            avatarUrl: entry.avatarUrl,
            balance: entry.balance,
          },
        })
      }
    >
      <Typography
        sx={{
          width: 24,
          textAlign: "center",
          color: "text.secondary",
          fontWeight: 600,
        }}
      >
        {entry.rank}
      </Typography>
      <Avatar src={entry.avatarUrl ?? undefined} sx={{ width: 36, height: 36 }}>
        {entry.username[0].toUpperCase()}
      </Avatar>
      <Typography fontWeight={600}>{entry.username}</Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Typography fontWeight={600}>
        {(entry.balance / 100).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </Typography>
    </Stack>
  );
};

export default function LeaderboardView() {
  const { data: entries, isLoading, error } = useLeaderboardQuery(20);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 600 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Leaderboard
      </Typography>
      <Stack divider={<Divider sx={{ mx: "4px" }} />}>
        {isLoading ? (
          <LeaderboardLoadingSkeleton />
        ) : error ? (
          <LeaderboardError error={error} />
        ) : (
          entries?.map((entry) => (
            <LeaderboardRow key={entry.userId} entry={entry} />
          ))
        )}
      </Stack>
    </Box>
  );
}
