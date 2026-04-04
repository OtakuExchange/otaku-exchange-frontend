import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { fetchUserPortfolio } from "../api";
import type { UUID } from "../models/models";
import { PortfolioStakeSections } from "../components/portfolio/PortfolioStakeSections";

export default function UserView() {
  const { userId } = useParams<{ userId: string }>();
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["portfolio", userId],
    queryFn: () => fetchUserPortfolio(userId as UUID, getToken),
    enabled: !!userId,
    staleTime: 30_000,
  });

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3, maxWidth: 750 }}
      >
        {isLoading ? (
          <Skeleton variant="circular" width={56} height={56} />
        ) : (
          <Avatar
            src={data?.avatarUrl ?? undefined}
            sx={{ width: 56, height: 56, fontSize: 24 }}
          >
            {data?.username?.[0]?.toUpperCase()}
          </Avatar>
        )}
        {isLoading ? (
          <Skeleton variant="text" width={160} height={40} />
        ) : (
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            {data?.username ?? "User"}
          </Typography>
        )}
        {isLoading ? (
          <Skeleton variant="text" width={80} height={40} />
        ) : (
          data?.balance != null && (
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{ color: "#7B8996", fontSize: "12px", lineHeight: 1.2 }}
              >
                FillyBucks
              </Typography>
              <Typography
                sx={{
                  color: "#3DB468",
                  fontSize: "20px",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {(
                  (data.balance +
                    (data.pools ?? [])
                      .filter((p) => p.eventStatus.toLowerCase() !== "resolved")
                      .reduce((sum, p) => sum + (p.userStake ?? 0), 0)) /
                  100
                ).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Typography>
            </Box>
          )
        )}
      </Stack>
      <PortfolioStakeSections items={data?.pools ?? []} loading={isLoading} />
    </Box>
  );
}
