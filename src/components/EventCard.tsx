import { useNavigate } from "react-router-dom";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Event } from "../models/models";
import { useApi } from "../hooks/useApi";
import { entityTextColor } from "../utils/entityTextColor";
import { usePoolsQuery } from "../hooks/queries/usePoolsQuery";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { EventStatusTag } from "./EventStatusTag";

export default function EventCard({
  event,
  bookmarked = event.bookmarked,
  onBookmarkChange,
}: {
  event: Event;
  bookmarked?: boolean;
  onBookmarkChange?: (id: Event["id"], bookmarked: boolean) => void;
}) {
  const navigate = useNavigate();
  const { bookmarkEvent, unbookmarkEvent } = useApi();
  const queryClient = useQueryClient();
  const { data: pools, isLoading } = usePoolsQuery(event.id);

  function handleBookmark() {
    onBookmarkChange?.(event.id, !bookmarked);
    const action = bookmarked
      ? unbookmarkEvent(event.id)
      : bookmarkEvent(event.id);
    action.catch(console.error);
  }

  function primeEventRouteCache() {
    // Avoid full-screen spinner on /events/:id by seeding react-query cache.
    queryClient.setQueryData(queryKeys.eventById(event.id), event);
    if (pools) {
      queryClient.setQueryData(queryKeys.poolsByEventId(event.id), pools);
    }
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        height: 210,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
      >
        <Box sx={{ mb: 0.5, lineHeight: 1 }}>
          <EventStatusTag status={event.status} closeTime={event.closeTime} />
        </Box>
        {isLoading ? (
          <Stack spacing={1} sx={{ flexGrow: 1, justifyContent: "center" }}>
            <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
          </Stack>
        ) : (
          <>
            {(() => {
              const totalVolume = (pools ?? []).reduce((sum, p) => sum + p.volume, 0);
              return (
                <Stack
                  sx={{ mb: 1 }}
                  onClick={() => {
                    primeEventRouteCache();
                    navigate(`/events/${event.id}`);
                  }}
                >
                  {(pools ?? []).map((pool, i) => {
                    const pct = totalVolume > 0 ? Math.round((pool.volume / totalVolume) * 100) : 0;
                    return (
                      <Stack
                        key={pool.id}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          height: 36,
                          minHeight: 36,
                          mb: i === 0 ? "4px" : 0,
                          cursor: "pointer",
                        }}
                      >
                        {pool.entity ? (
                          <Box
                            component="img"
                            src={pool.entity.logoPath}
                            sx={{ width: 24, height: 24, flexShrink: 0, borderRadius: 0.5 }}
                          />
                        ) : (
                          <Box sx={{ width: 24, height: 24, flexShrink: 0 }} />
                        )}
                        <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 600 }}>
                          {pool.entity?.name ?? pool.label}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: "#7B8996" }}>
                          {pct}%
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              );
            })()}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: "auto", height: 40, minHeight: 40 }}
            >
              {(pools ?? []).map((pool) => {
                const color = pool.entity?.color ?? "#1565c0";
                return (
                  <Button
                    key={pool.id}
                    size="small"
                    variant="contained"
                    fullWidth
                    sx={{
                      height: 40,
                      minHeight: 40,
                      py: 0,
                      fontWeight: "bold",
                      bgcolor: color + "26",
                      color: entityTextColor(color),
                      "&:hover": { bgcolor: color + "40" },
                    }}
                    onClick={() =>
                      (primeEventRouteCache(),
                      navigate(`/events/${event.id}`, {
                        state: { selectedPoolId: pool.id },
                      }))
                    }
                  >
                    {pool.entity?.abbreviatedName ?? pool.label}
                  </Button>
                );
              })}
            </Stack>
          </>
        )}
      </CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          height: 28,
          mb: "8px",
        }}
      >
        <Typography variant="caption" sx={{ flexGrow: 1, color: "#7B8996" }}>
          {((pools ?? []).reduce((sum, p) => sum + p.volume, 0) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })} Vol.
        </Typography>
        <IconButton
          size="small"
          sx={{ p: 0, color: "#7B8996" }}
          onClick={handleBookmark}
        >
          {bookmarked ? (
            <BookmarkIcon fontSize="small" />
          ) : (
            <BookmarkBorderIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
    </Card>
  );
}
