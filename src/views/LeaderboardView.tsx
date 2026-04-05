import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { LeaderboardEntry } from "../api";
import { useApi } from "../hooks/useApi";

export default function LeaderboardView() {
  const { fetchLeaderboard } = useApi();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard(20)
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchLeaderboard]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 600 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Leaderboard
      </Typography>
      <Stack divider={<Divider sx={{ mx: "4px" }} />}>
        {loading
          ? [0, 1, 2, 3, 4].map((i) => (
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
            ))
          : entries.map((entry) => (
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
                    textAlign: "right",
                    color: "text.secondary",
                    fontWeight: 600,
                  }}
                >
                  {entry.rank}
                </Typography>
                <Avatar
                  src={entry.avatarUrl ?? undefined}
                  sx={{ width: 36, height: 36 }}
                >
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
            ))}
      </Stack>
    </Box>
  );
}
