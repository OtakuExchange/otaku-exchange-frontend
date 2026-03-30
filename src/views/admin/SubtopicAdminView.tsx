import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LinkIcon from "@mui/icons-material/Link";
import { useApi } from "../../hooks/useApi";
import type { Topic, Subtopic, Event, UUID } from "../../models/models";

export default function SubtopicAdminView() {
  const api = useApi();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // create form
  const [createTopicId, setCreateTopicId] = useState<UUID | "">("");
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // link form
  const [linkSubtopicId, setLinkSubtopicId] = useState<UUID | "">("");
  const [linkEvent, setLinkEvent] = useState<Event | null>(null);
  const [linking, setLinking] = useState(false);
  const [linkResult, setLinkResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const topicsData = await api.fetchTopics() as Topic[];
      setTopics(topicsData);
      const allEvents: Event[] = [];
      await Promise.all(
        topicsData.map(async (t) => {
          try {
            const evts = await api.fetchEvents(t.id);
            allEvents.push(...evts);
          } catch {}
        }),
      );
      setEvents(allEvents);
    } catch (e: any) {
      setLoadError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!createTopicId || !createName.trim()) return;
    setCreating(true);
    setCreateResult(null);
    try {
      await api.createSubtopic(createTopicId as UUID, createName.trim());
      setCreateResult({ ok: true, msg: "Subtopic created." });
      setCreateName("");
      await load();
    } catch (e: any) {
      setCreateResult({ ok: false, msg: e?.message ?? "Failed to create subtopic." });
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteSubtopic(subtopic: Subtopic) {
    if (!confirm(`Delete subtopic "${subtopic.name}"?`)) return;
    try {
      await api.deleteSubtopic(subtopic.id);
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Failed to delete");
    }
  }

  async function handleLink() {
    if (!linkSubtopicId || !linkEvent) return;
    setLinking(true);
    setLinkResult(null);
    try {
      await api.linkEventToSubtopic(linkEvent.id, linkSubtopicId as UUID);
      setLinkResult({ ok: true, msg: `Linked "${linkEvent.name}" successfully.` });
      setLinkEvent(null);
    } catch (e: any) {
      setLinkResult({ ok: false, msg: e?.message ?? "Failed to link." });
    } finally {
      setLinking(false);
    }
  }

  // events filtered to the topic that owns the selected subtopic
  const selectedSubtopic = topics
    .flatMap((t) => t.subtopics)
    .find((s) => s.id === linkSubtopicId);
  const filteredEvents = selectedSubtopic
    ? events.filter((e) => e.topicId === selectedSubtopic.topicId)
    : events;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 560 }}>
      <Typography variant="h5">Subtopics</Typography>

      {/* ── Create ─────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 600 }}>
          Create Subtopic
        </Typography>

        <FormControl size="small" fullWidth>
          <InputLabel>Topic</InputLabel>
          <Select
            label="Topic"
            value={createTopicId}
            onChange={(e) => setCreateTopicId(e.target.value as UUID)}
          >
            {topics.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.topic}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Subtopic Name"
          size="small"
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          disabled={creating}
          placeholder="e.g. Western Conference"
        />

        {createResult && (
          <Alert severity={createResult.ok ? "success" : "error"} onClose={() => setCreateResult(null)}>
            {createResult.msg}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={creating || !createTopicId || !createName.trim()}
          startIcon={creating ? <CircularProgress size={16} /> : undefined}
          sx={{ alignSelf: "flex-start" }}
        >
          {creating ? "Creating…" : "Create Subtopic"}
        </Button>
      </Box>

      <Divider />

      {/* ── Link Event ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 600 }}>
          <LinkIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
          Link Event to Subtopic
        </Typography>

        <FormControl size="small" fullWidth>
          <InputLabel>Subtopic</InputLabel>
          <Select
            label="Subtopic"
            value={linkSubtopicId}
            onChange={(e) => {
              setLinkSubtopicId(e.target.value as UUID);
              setLinkEvent(null);
            }}
          >
            {topics.map((t) =>
              t.subtopics.length === 0 ? null : (
                [
                  <MenuItem key={`header-${t.id}`} disabled sx={{ opacity: 0.5, fontSize: 12 }}>
                    {t.topic.toUpperCase()}
                  </MenuItem>,
                  ...t.subtopics.map((s) => (
                    <MenuItem key={s.id} value={s.id} sx={{ pl: 3 }}>
                      {s.name}
                    </MenuItem>
                  )),
                ]
              )
            )}
          </Select>
        </FormControl>

        <Autocomplete
          size="small"
          options={filteredEvents}
          getOptionLabel={(e) => e.name}
          value={linkEvent}
          onChange={(_, v) => setLinkEvent(v)}
          disabled={!linkSubtopicId}
          renderInput={(params) => (
            <TextField
              {...params}
              label={linkSubtopicId ? "Event" : "Select a subtopic first"}
            />
          )}
        />

        {linkResult && (
          <Alert severity={linkResult.ok ? "success" : "error"} onClose={() => setLinkResult(null)}>
            {linkResult.msg}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleLink}
          disabled={linking || !linkSubtopicId || !linkEvent}
          startIcon={linking ? <CircularProgress size={16} /> : <LinkIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          {linking ? "Linking…" : "Link Event"}
        </Button>
      </Box>

      <Divider />

      {/* ── List ───────────────────────────────────────────────────────────── */}
      <Box>
        <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 600, mb: 2 }}>
          All Subtopics
        </Typography>

        {topics.every((t) => t.subtopics.length === 0) ? (
          <Typography variant="body2" color="text.secondary">
            No subtopics yet.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {topics.map((t) =>
              t.subtopics.length === 0 ? null : (
                <Box key={t.id}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1, textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    {t.topic}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {t.subtopics.map((s) => (
                      <Chip
                        key={s.id}
                        label={s.name}
                        size="small"
                        onDelete={() => handleDeleteSubtopic(s)}
                        deleteIcon={<DeleteOutlineIcon />}
                      />
                    ))}
                  </Stack>
                </Box>
              )
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}