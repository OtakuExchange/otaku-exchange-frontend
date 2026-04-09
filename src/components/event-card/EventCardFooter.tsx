import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import type { PoolItem } from "../../hooks/queries/usePoolsQuery";
import { EventCloseTime } from "../event/EventCloseTime";
import type { Event } from "../../models/models";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

export function EventCardFooter({
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