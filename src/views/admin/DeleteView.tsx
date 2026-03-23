import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Event, Market, Topic } from "../../models/models";
import { useApi } from "../../hooks/useApi";
import { useTopics } from "../../contexts/TopicsContext";

export default function DeleteView() {
  const { fetchEvents, fetchMarkets, deleteTopic, deleteEvent, deleteMarket } =
    useApi();
  const topics = useTopics();
  const [topicId, setTopicId] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState("");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketId, setMarketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!topicId) {
      setEvents([]);
      setEventId("");
      return;
    }
    fetchEvents(topicId as Topic["id"])
      .then(setEvents)
      .catch(console.error);
  }, [topicId]);

  useEffect(() => {
    if (!eventId) {
      setMarkets([]);
      setMarketId("");
      return;
    }
    fetchMarkets(eventId as Event["id"])
      .then(setMarkets)
      .catch(console.error);
  }, [eventId]);

  const buttonLabel = marketId
    ? "Delete Market"
    : eventId
      ? "Delete Event"
      : topicId
        ? "Delete Topic"
        : "Delete";
  const canSubmit = !loading && !!topicId;

  async function handleDelete() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (marketId) {
        await deleteMarket(marketId as Market["id"]);
        setSuccess("Market deleted successfully.");
        setMarketId("");
        setMarkets((prev) => prev.filter((m) => m.id !== marketId));
      } else if (eventId) {
        await deleteEvent(eventId as Event["id"]);
        setSuccess("Event deleted successfully.");
        setEventId("");
        setMarketId("");
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } else {
        await deleteTopic(topicId as Topic["id"]);
        setSuccess("Topic deleted successfully.");
        setTopicId("");
        setEventId("");
        setMarketId("");
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
          setTopicId(e.target.value);
          setEventId("");
          setMarketId("");
        }}
        disabled={loading}
      >
        {topics.map((t) => (
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
          setEventId(e.target.value);
          setMarketId("");
        }}
        disabled={loading || !topicId}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {events.map((ev) => (
          <MenuItem key={ev.id} value={ev.id}>
            {ev.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Market"
        value={marketId}
        onChange={(e) => setMarketId(e.target.value)}
        disabled={loading || !eventId}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {markets.map((m) => (
          <MenuItem key={m.id} value={m.id}>
            {m.label}
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
