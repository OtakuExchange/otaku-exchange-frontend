import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
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
                label={subtopic.name}
                clickable
                onClick={() => onSelect(isSelected ? null : subtopic.id)}
                variant={isSelected ? "filled" : "outlined"}
                sx={{
                  fontWeight: 800,
                  borderColor: "#252b31",
                  ...(isSelected
                    ? { bgcolor: "action.hover" }
                    : { bgcolor: "transparent" }),
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
        width: 220,
        flexShrink: 0,
        pt: 2,
        ml: "10px",
      }}
    >
      <List dense disablePadding>
        {subtopics.map((subtopic) => (
          <ListItemButton
            key={subtopic.id}
            selected={selected === subtopic.id}
            onClick={() =>
              onSelect(selected === subtopic.id ? null : subtopic.id)
            }
            sx={{ height: 40, px: "10px", borderRadius: 2 }}
          >
            <ListItemText
              primary={subtopic.name}
              slotProps={{ primary: { variant: "body2", fontWeight: "bold" } }}
            />
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
