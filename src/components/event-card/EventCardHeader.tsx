import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { multiplierColor } from "../../utils/parimutuel";
import { EventStatusTag } from "../EventStatusTag";
import type { Event } from "../../models/models";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { EventCardTitle } from "./EventCardTitle";
import { FirstBetBonusBadge } from "../trade-card/FirstBetBonusBadge";

export function EventCardHeaderSingle({
  event,
  title = "",
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

      {event.isFirstStakeBonusEligible &&
        (event.status === "open" || event.status === "hidden") && (
          <FirstBetBonusBadge variant="icon"/>
        )}

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
            flexShrink: 0,
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

export function EventCardHeaderMulti({
  event,
  openEvent,
  bookmarked,
  handleBookmark,
}: {
  event: Event;
  openEvent: () => void;
  bookmarked: boolean;
  handleBookmark: () => void;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.5 }}>
      {event.logoPath && (
        <Box
          component="img"
          src={event.logoPath}
          onClick={openEvent}
          sx={{
            width: 36,
            height: 36,
            borderRadius: 0.5,
            flexShrink: 0,
            cursor: "pointer",
          }}
        />
      )}
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography
          variant="body2"
          fontWeight={800}
          onClick={openEvent}
          sx={{ cursor: "pointer", lineHeight: 1.3, mb: 0.25 }}
        >
          {event.name}
        </Typography>
        <EventCardHeaderSingle
          event={event}
          title={event.alias ?? ""}
          bookmarked={bookmarked}
          onBookmark={handleBookmark}
        />
      </Box>
    </Stack>
  );
}
