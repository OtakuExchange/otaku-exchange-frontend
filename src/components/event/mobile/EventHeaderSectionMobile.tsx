import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { multiplierColor } from "../../../utils/parimutuel";
import { EventStatusTag } from "../../EventStatusTag";
import type { Event } from "../../../models/models";

export function EventHeaderSectionMobile({
    event,
    topicName,
  }: {
    event: Event;
    topicName: string | undefined;
  }) {
    return (
      <Stack spacing={1.25} sx={{ mb: 1.5, display: { xs: "flex", md: "none" } }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {event.logoPath && (
            <Box
              component="img"
              src={event.logoPath}
              sx={{ width: 44, height: 44, borderRadius: 1, flexShrink: 0 }}
            />
          )}
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            {topicName && (
              <Typography sx={{ color: "#7B8996", fontSize: "13px", mb: 0.25 }}>
                {topicName}
              </Typography>
            )}
            <Typography
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: "18px",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {event.name}
            </Typography>
          </Box>
        </Stack>
  
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <EventStatusTag status={event.status} closeTime={event.closeTime} />
          {event.multiplier > 1 && (
            <Chip
              label={`${event.multiplier}x`}
              size="small"
              sx={{
                bgcolor: multiplierColor(event.multiplier),
                color: "#000",
                fontWeight: 800,
                fontSize: "12px",
                height: 22,
                letterSpacing: "0.02em",
              }}
            />
          )}
        </Stack>
      </Stack>
    );
  }