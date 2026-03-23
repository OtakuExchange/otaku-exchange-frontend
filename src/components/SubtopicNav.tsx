import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import type { Subtopic, UUID } from "../models/models";

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
    <Box sx={{ width: 220, flexShrink: 0, pt: 2, ml: "10px" }}>
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
