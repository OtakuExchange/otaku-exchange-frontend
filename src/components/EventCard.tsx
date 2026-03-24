import { useEffect, useState } from "react";
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
import type { Event, Market } from "../models/models";
import { useApi } from "../hooks/useApi";
import { entityTextColor } from "../utils/entityTextColor";
import { useMarketsQuery } from "../hooks/queries/useMarketsQuery";

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
  const { data: markets, isLoading, error } = useMarketsQuery(event.id);
  const matchMarket = markets ? markets.find((m) => m.isMatch) : null;
  const isMatch =
    markets && event.format === "binary" && matchMarket !== null;

  function handleBookmark() {
    onBookmarkChange?.(event.id, !bookmarked);
    const action = bookmarked
      ? unbookmarkEvent(event.id)
      : bookmarkEvent(event.id);
    action.catch(console.error);
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        height: 188,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
      >
        {isLoading ? (
          <Stack spacing={1} sx={{ flexGrow: 1, justifyContent: "center" }}>
            <Skeleton
              variant="rectangular"
              height={36}
              sx={{ borderRadius: 1 }}
            />
            <Skeleton
              variant="rectangular"
              height={36}
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        ) : markets && isMatch ? (
          <Stack
            sx={{ mb: 1 }}
            onClick={() =>
              navigate(`/events/${event.id}`, { state: { event, markets } })
            }
          >
            {[matchMarket!.entity, matchMarket!.relatedEntity].map(
              (entity, i) => (
                <Stack
                  key={i}
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
                  {entity ? (
                    <Box
                      component="img"
                      src={entity.logoPath}
                      sx={{
                        width: 24,
                        height: 24,
                        flexShrink: 0,
                        borderRadius: 0.5,
                      }}
                    />
                  ) : (
                    <Box sx={{ width: 24, height: 24, flexShrink: 0 }} />
                  )}
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {entity ? entity.name : matchMarket!.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    50%
                  </Typography>
                </Stack>
              ),
            )}
          </Stack>
        ) : (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: "10px", cursor: "pointer" }}
            onClick={() =>
              navigate(`/events/${event.id}`, { state: { event, markets } })
            }
          >
            {event.logoPath && (
              <Box
                component="img"
                src={event.logoPath}
                sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: 0.5 }}
              />
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                fontSize: "14px",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {event.name}
            </Typography>
          </Stack>
        )}
        {markets && isMatch ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mt: "auto", height: 40, minHeight: 40 }}
          >
            {[matchMarket!.entity, matchMarket!.relatedEntity].map(
              (entity, i) => {
                const defaultColor = i === 0 ? "#40c3ff" : "#ff3333";
                const entityColor = entity?.color ?? defaultColor;
                return (
                  <Button
                    key={i}
                    size="small"
                    variant="contained"
                    fullWidth
                    sx={{
                      height: 40,
                      minHeight: 40,
                      py: 0,
                      fontWeight: "bold",
                      bgcolor: entityColor + "26",
                      color: entityTextColor(entityColor),
                      "&:hover": { bgcolor: entityColor + "40" },
                    }}
                    onClick={() =>
                      navigate(`/events/${event.id}`, {
                        state: { event, markets, side: i === 0 ? "YES" : "NO" },
                      })
                    }
                  >
                    {entity?.abbreviatedName ?? matchMarket!.label}
                  </Button>
                );
              },
            )}
          </Stack>
        ) : (
          <Stack
            spacing={0}
            sx={{
              mt: 1,
              maxHeight: 70,
              overflowY: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
          >
            {[...(markets ?? [])]
              .sort((a, b) => b.tradeVolume - a.tradeVolume)
              .map((market, i) => (
                <Stack
                  key={i}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ height: 27, minHeight: 27, mb: "8px" }}
                >
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {market.label}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      height: 27,
                      minHeight: 27,
                      py: 0,
                      bgcolor: "#1a3d2b",
                      color: "#4caf50",
                      "&:hover": { bgcolor: "#1f4d33" },
                    }}
                    onClick={() =>
                      navigate(`/events/${event.id}`, {
                        state: { event, markets, selectedMarketId: market.id, side: "YES" },
                      })
                    }
                  >
                    Yes
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      height: 27,
                      minHeight: 27,
                      py: 0,
                      bgcolor: "#3d1a1a",
                      color: "#f44336",
                      "&:hover": { bgcolor: "#4d1f1f" },
                    }}
                    onClick={() =>
                      navigate(`/events/${event.id}`, {
                        state: { event, markets, selectedMarketId: market.id, side: "NO" },
                      })
                    }
                  >
                    No
                  </Button>
                </Stack>
              ))}
          </Stack>
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
          ${event.tradeVolume.toLocaleString()} Vol.
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
