import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Entity, UUID } from "../../models/models";
import { useApi } from "../../hooks/useApi";
import { useTopics } from "../../contexts/TopicsContext";

export default function CreateMarketView() {
  const { fetchEvents, fetchEntities, createMarketPool } = useApi();
  const topics = useTopics();

  const [topicId, setTopicId] = useState<UUID | "">("");
  const [events, setEvents] = useState<{ id: UUID; name: string; status: string }[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);

  const [pools, setPools] = useState([
    { label: "", entityId: "" as UUID | "" },
    { label: "", entityId: "" as UUID | "" },
  ]);

  const [selectedEventId, setSelectedEventId] = useState<UUID | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchEntities().then(setEntities).catch(console.error);
  }, []);

  useEffect(() => {
    if (!topicId) { setEvents([]); setSelectedEventId(""); return; }
    setLoadingEvents(true);
    fetchEvents(topicId)
      .then((evts) => setEvents(evts.map((e) => ({ id: e.id, name: e.name, status: e.status }))))
      .catch(console.error)
      .finally(() => setLoadingEvents(false));
  }, [topicId]);

  function updatePool(index: number, field: "label" | "entityId", value: string) {
    setPools((prev) => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }

  function addPool() {
    setPools((prev) => [...prev, { label: "", entityId: "" }]);
  }

  function removePool(index: number) {
    setPools((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!selectedEventId) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await Promise.all(
        pools.map((p) =>
          createMarketPool(
            selectedEventId,
            p.label,
            p.entityId ? (p.entityId as UUID) : null
          )
        )
      );
      setSuccess(true);
      setPools([{ label: "", entityId: "" }, { label: "", entityId: "" }]);
      setSelectedEventId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create pools");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    !loading &&
    !!selectedEventId &&
    pools.length > 0 &&
    pools.every((p) => p.label.trim());

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 520 }}>
      <Typography variant="h5">Create Market Pools</Typography>

      <TextField
        select
        label="Topic"
        value={topicId}
        onChange={(e) => setTopicId(e.target.value as UUID)}
        disabled={loading}
      >
        {topics.map((t) => (
          <MenuItem key={t.id} value={t.id}>{t.topic}</MenuItem>
        ))}
      </TextField>

      {loadingEvents ? (
        <CircularProgress size={20} />
      ) : (
        <TextField
          select
          label="Event"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value as UUID)}
          disabled={loading || !topicId || events.length === 0}
        >
          {events
            .filter((e) => e.status?.toLowerCase() === "open" || e.status?.toLowerCase() === "hidden")
            .map((e) => (
              <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
            ))}
        </TextField>
      )}

      <Divider />

      <Typography variant="subtitle2">Pools</Typography>
      {pools.map((pool, i) => (
        <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            label={`Pool ${i + 1} Label`}
            value={pool.label}
            onChange={(e) => updatePool(i, "label", e.target.value)}
            disabled={loading}
            size="small"
            sx={{ flexGrow: 1 }}
          />
          <TextField
            select
            label="Entity"
            value={pool.entityId}
            onChange={(e) => updatePool(i, "entityId", e.target.value)}
            disabled={loading}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">None</MenuItem>
            {entities.map((e) => (
              <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
            ))}
          </TextField>
          {pools.length > 2 && (
            <Button size="small" color="error" onClick={() => removePool(i)}>✕</Button>
          )}
        </Box>
      ))}

      <Button variant="outlined" size="small" onClick={addPool} disabled={loading} sx={{ alignSelf: "flex-start" }}>
        + Add Pool
      </Button>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Pools created successfully.</Alert>}

      <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
        {loading ? <CircularProgress size={18} /> : "Create Pools"}
      </Button>
    </Box>
  );
}