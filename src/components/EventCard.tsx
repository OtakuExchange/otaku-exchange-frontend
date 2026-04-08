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
import { multiplierColor } from "../utils/parimutuel";
import { EventCloseTime } from "./event/EventCloseTime";

type PoolItem = NonNullable<ReturnType<typeof usePoolsQuery>["data"]>[number];

function EventCardHeader({
  event,
  title,
  bookmarked,
  onBookmark,
}: {
  event: Event;
  title: string;
  bookmarked: boolean;
  onBookmark: () => void;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ mb: { xs: 0.75, md: 0.5 } }}
    >
      <EventStatusTag
        status={event.status}
        closeTime={event.closeTime}
        showCloseTime={false}
      />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <EventCardTitle name={title} />
      </Box>
      {event.multiplier > 1 && (
        <Typography
          variant="caption"
          sx={{
            color: "#16191d",
            bgcolor: multiplierColor(event.multiplier),
            px: 0.75,
            py: 0.25,
            borderRadius: 999,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {event.multiplier}x
        </Typography>
      )}

      {/* Mobile-only bookmark (desktop bookmark lives in footer) */}
      <IconButton
        size="small"
        sx={{
          p: 0,
          color: "#7B8996",
          display: { xs: "inline-flex", md: "none" },
        }}
        onClick={(e) => {
          e.stopPropagation();
          onBookmark();
        }}
      >
        {bookmarked ? (
          <BookmarkIcon fontSize="small" />
        ) : (
          <BookmarkBorderIcon fontSize="small" />
          )}
        </IconButton>
      </Stack>
  );
}

function EventCardTitle({
  name,
}: {
  name: string;
}) {
  return (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 700,
        color: "#7B8996",
        opacity: 0.7,
        letterSpacing: "0.02em",
        lineHeight: 1.1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        display: "block",
      }}
      title={name}
    >
      {name}
    </Typography>
  );
}

function PoolsSkeleton() {
  return (
    <Stack spacing={1} sx={{ flexGrow: 1, justifyContent: "center" }}>
      <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
    </Stack>
  );
}

function MobileEventCardBody({
  pools,
  totalVolume,
  onSelectPool,
}: {
  pools: PoolItem[];
  totalVolume: number;
  onSelectPool: (poolId: string) => void;
}) {
  return (
    <Stack spacing={1} sx={{ display: { xs: "flex", md: "none" } }}>
      {pools.map((pool) => {
        const pct =
          totalVolume > 0 ? Math.round((pool.volume / totalVolume) * 100) : 0;
        const color = pool.entity?.color ?? "#1565c0";
        return (
          <Button
            key={pool.id}
            size="medium"
            variant="contained"
            fullWidth
            sx={{
              justifyContent: "space-between",
              py: 1,
              borderRadius: 2,
              fontWeight: 800,
              bgcolor: color + "26",
              color: entityTextColor(color),
              "&:hover": { bgcolor: color + "40" },
              textTransform: "none",
            }}
            onClick={() => onSelectPool(pool.id)}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {pool.entity?.logoPath ? (
                <Box
                  component="img"
                  src={pool.entity.logoPath}
                  sx={{ width: 24, height: 24, borderRadius: 0.5 }}
                />
              ) : (
                <Box sx={{ width: 24, height: 24 }} />
              )}
              <Typography sx={{ fontWeight: 800 }}>
                {pool.entity?.abbreviatedName ?? pool.label}
              </Typography>
            </Stack>
            <Typography sx={{ fontWeight: 800, color: "#7B8996" }}>
              {pct}%
            </Typography>
          </Button>
        );
      })}
    </Stack>
  );
}

function DesktopEventCardBody({
  pools,
  totalVolume,
  onOpenEvent,
  onSelectPool,
}: {
  pools: PoolItem[];
  totalVolume: number;
  onOpenEvent: () => void;
  onSelectPool: (poolId: string) => void;
}) {
  return (
    <Box sx={{ display: { xs: "none", md: "block" } }}>
      <Stack sx={{ mb: 1 }} onClick={onOpenEvent}>
        {pools.map((pool, i) => {
          const pct =
            totalVolume > 0 ? Math.round((pool.volume / totalVolume) * 100) : 0;
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
              <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 600 }}>
                {pool.entity?.name ?? pool.label}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: "#7B8996" }}
              >
                {pct}%
              </Typography>
            </Stack>
          );
        })}
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ mt: "auto", height: 40, minHeight: 40 }}
      >
        {pools.map((pool) => {
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
              onClick={() => onSelectPool(pool.id)}
            >
              {pool.entity?.abbreviatedName ?? pool.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}

function DesktopEventCardFooter({
  event,
  pools,
  bookmarked,
  onBookmark,
}: {
  event: Event;
  pools: PoolItem[] | undefined;
  bookmarked: boolean;
  onBookmark: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        height: 28,
        mb: "8px",
        position: "relative",
        zIndex: 2,
      }}
    >
      <EventCloseTime closeTime={event.closeTime} />
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" sx={{ color: "#7B8996" }}>
          {(
            (pools ?? []).reduce((sum, p) => sum + p.volume, 0) / 100
          ).toLocaleString("en-US", { style: "currency", currency: "USD" })}{" "}
          Vol.
        </Typography>
        <IconButton
          size="small"
          sx={{ p: 0, color: "#7B8996", display: { xs: "none", md: "inline-flex" } }}
          onClick={onBookmark}
        >
          {bookmarked ? (
            <BookmarkIcon fontSize="small" />
          ) : (
            <BookmarkBorderIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
    </Box>
  );
}

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
    queryClient.setQueryData(queryKeys.eventById(event.id), event);
    if (pools) {
      queryClient.setQueryData(queryKeys.poolsByEventId(event.id), pools);
    }
  }

  const poolsList = pools ?? [];
  const totalVolume = poolsList.reduce((sum, p) => sum + p.volume, 0);

  function openEvent() {
    primeEventRouteCache();
    navigate(`/events/${event.id}`);
  }

  function selectPool(poolId: string) {
    primeEventRouteCache();
    navigate(`/events/${event.id}`, { state: { selectedPoolId: poolId } });
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        height: "auto",
        minHeight: { xs: "auto", md: 210 },
        display: "flex",
        flexDirection: "column",
        position: "relative",
        ...(event.isNew && {
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.5s infinite",
            pointerEvents: "none",
            zIndex: 1,
          },
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "200% 0" },
            "100%": { backgroundPosition: "-200% 0" },
          },
          boxShadow: "0 0 0 1.5px rgba(255,255,255,0.12)",
        }),
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          pb: { xs: 2, md: 1.5 },
          position: "relative",
          zIndex: 2,
        }}
      >
        <EventCardHeader
          event={event}
          title={event.alias ?? event.name}
          bookmarked={bookmarked}
          onBookmark={handleBookmark}
        />
        {isLoading ? (
          <PoolsSkeleton />
        ) : (
          <>
            <MobileEventCardBody
              pools={poolsList}
              totalVolume={totalVolume}
              onSelectPool={selectPool}
            />
            <DesktopEventCardBody
              pools={poolsList}
              totalVolume={totalVolume}
              onOpenEvent={openEvent}
              onSelectPool={selectPool}
            />
          </>
        )}
      </CardContent>

      {/* Desktop footer (md+): volume + bookmark */}
      <DesktopEventCardFooter
        event={event}
        pools={pools}
        bookmarked={bookmarked}
        onBookmark={handleBookmark}
      />
    </Card>
  );
}
