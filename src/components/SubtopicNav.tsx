import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Subtopic, UUID } from "../models/models";

function MobileSubtopicNav({
  subtopics,
  selected,
  onSelect,
}: {
  subtopics: Subtopic[];
  selected: UUID | null;
  onSelect: (id: UUID | null) => void;
}) {
  return (
    <Box
      sx={{
        display: { xs: "block", md: "none" },
        px: { xs: 2, sm: 3 },
        pt: 2,
        pb: 1,
        borderBottom: "1px solid #252b31",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Stack direction="row" spacing={1} sx={{ minWidth: "max-content" }}>
          {subtopics.map((subtopic) => {
            const isSelected = selected === subtopic.id;
            return (
              <Chip
                key={subtopic.id}
                size="small"
                label={
                  subtopic.isNew ? (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#9c27b0", flexShrink: 0 }} />
                      <span>{subtopic.name}</span>
                    </Stack>
                  ) : subtopic.name
                }
                clickable
                onClick={() => onSelect(isSelected ? null : subtopic.id)}
                variant={isSelected ? "filled" : "outlined"}
                sx={{
                  fontWeight: 800,
                  borderColor: "#252b31",
                  ...(isSelected
                    ? { bgcolor: "action.hover" }
                    : { bgcolor: "transparent" }),
                  ...(subtopic.isNew && {
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      borderRadius: "inherit",
                      background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2.5s infinite",
                      pointerEvents: "none",
                    },
                    "@keyframes shimmer": {
                      "0%": { backgroundPosition: "200% 0" },
                      "100%": { backgroundPosition: "-200% 0" },
                    },
                    position: "relative",
                  }),
                }}
              />
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}

function DesktopSubtopicNav({
  subtopics,
  selected,
  onSelect,
}: {
  subtopics: Subtopic[];
  selected: UUID | null;
  onSelect: (id: UUID | null) => void;
}) {
  return (
    <Box
      sx={{
        display: { xs: "none", md: "block" },
        width: 244,
        flexShrink: 0,
        pt: 2,
      }}
    >
      <Typography variant="caption" sx={{ color: "#7B8996", fontWeight: 600, pl: "28px", display: "block", mb: 0.5 }}>
        Divisions
      </Typography>
      <List dense disablePadding>
        {subtopics.map((subtopic) => (
          <ListItemButton
            key={subtopic.id}
            selected={selected === subtopic.id}
            onClick={() =>
              onSelect(selected === subtopic.id ? null : subtopic.id)
            }
            sx={{ height: 40, pl: "10px", pr: "10px", borderRadius: 0 }}
          >
            <Box sx={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0, mr: 1,
              ...(subtopic.isNew ? {
                background: "linear-gradient(120deg, #b8860b, #ffd700, #fffacd, #ffd700, #b8860b)",
                backgroundSize: "300% 100%",
                animation: "dotShimmer 2s infinite",
                "@keyframes dotShimmer": {
                  "0%": { backgroundPosition: "200% 0" },
                  "100%": { backgroundPosition: "-200% 0" },
                },
              } : {
                bgcolor: "transparent",
              }),
            }} />
            <ListItemText
              primary={subtopic.name}
              slotProps={{ primary: { variant: "body2", fontWeight: "bold" } }}
            />
            {subtopic.eventCount != null && (
              <Typography variant="body2" fontWeight={600} sx={{ color: "#7B8996", ml: 1, flexShrink: 0 }}>
                {subtopic.eventCount}
              </Typography>
            )}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export default function SubtopicNav({
  subtopics,
  selected,
  onSelect,
}: {
  subtopics: Subtopic[];
  selected: UUID | null;
  onSelect: (id: UUID | null) => void;
}) {
  return (
    <>
      <MobileSubtopicNav
        subtopics={subtopics}
        selected={selected}
        onSelect={onSelect}
      />
      <DesktopSubtopicNav
        subtopics={subtopics}
        selected={selected}
        onSelect={onSelect}
      />
    </>
  );
}
