import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { multiplierColor } from "../../../utils/parimutuel";
import { EventStatusTag } from "../../EventStatusTag";
import type { Event } from "../../../models/models";

export function EventHeaderSection({
  event,
  topicName,
}: {
  event: Event;
  topicName: string | undefined;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ mb: 2, display: { xs: "none", md: "flex" } }}
    >
      {event.logoPath && (
        <Box
          component="img"
          src={event.logoPath}
          sx={{ width: 64, height: 64, borderRadius: 1, flexShrink: 0 }}
        />
      )}
      <Box sx={{ minWidth: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          flexWrap="wrap"
          sx={{ mb: 0.5 }}
        >
          {topicName && (
            <Typography sx={{ color: "#7B8996", fontSize: "14px" }}>
              {topicName}
            </Typography>
          )}
          <EventStatusTag status={event.status} closeTime={event.closeTime} />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 600, fontSize: "24px" }}
          >
            {event.name}
          </Typography>
          {event.multiplier > 1 && (
            <Chip
              label={`${event.multiplier}x`}
              size="small"
              sx={{
                bgcolor: multiplierColor(event.multiplier),
                color: "#000",
                fontWeight: 800,
                fontSize: "13px",
                height: 24,
                letterSpacing: "0.02em",
              }}
            />
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
