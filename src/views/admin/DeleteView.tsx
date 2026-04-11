import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Event, Topic, UUID } from "../../models/models";
import { useTopicEventsQuery, useTopicsQuery } from "../../api/topic/topic.queries";
import { useTopicMutation } from "../../api/topic/topic.mutations";
import { useEventMutation } from "../../api/events/events.mutations";

export default function DeleteView() {
  const [eventId, setEventId] = useState<UUID | null>(null);
  const { deleteTopic } = useTopicMutation();
  const { deleteEvent } = useEventMutation();
  const { data: topics = [] } = useTopicsQuery(); 
  const [topicId, setTopicId] = useState<UUID | "">("");
  const { data: events = [] } = useTopicEventsQuery(topicId, null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const buttonLabel = eventId
      ? "Delete Event"
      : topicId
        ? "Delete Topic"
        : "Delete";
  const canSubmit = !loading && topicId !== null;

  async function handleDelete() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (eventId && topicId) {
        await deleteEvent({ eventId: eventId as UUID, topicId: topicId as UUID});
        setSuccess("Event deleted successfully.");
        setEventId(null);
      } else if(topicId) {
        await deleteTopic(topicId as UUID);
        setSuccess("Topic deleted successfully.");
        setTopicId("");
        setEventId(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}
    >
      <Typography variant="h5">Delete</Typography>
      <TextField
        select
        label="Topic"
        value={topicId}
        onChange={(e) => {
          setTopicId(e.target.value as UUID);
          setEventId(null);
        }}
        disabled={loading}
      >
        {topics.map((t: Topic) => (
          <MenuItem key={t.id} value={t.id}>
            {t.topic}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Event"
        value={eventId}
        onChange={(e) => {
          setEventId(e.target.value as UUID);
        }}
        disabled={loading || !topicId}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {events.map((ev: Event) => (
          <MenuItem key={ev.id} value={ev.id}>
            {ev.name}
          </MenuItem>
        ))}
      </TextField>
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      {success && (
        <Typography color="success.main" variant="body2">
          {success}
        </Typography>
      )}
      <Button
        variant="contained"
        color="error"
        onClick={handleDelete}
        disabled={!canSubmit}
      >
        {buttonLabel}
      </Button>
    </Box>
  );
}
