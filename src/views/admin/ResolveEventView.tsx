import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Event, Pool, UUID } from "../../models/models";
import { useApi } from "../../hooks/useApi";
import { useTopics } from "../../contexts/TopicsContext";

export default function ResolveEventView() {
  const { fetchEvents, fetchPools, resolveEvent } = useApi();
  const topics = useTopics();

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [expandedEventId, setExpandedEventId] = useState<UUID | null>(null);
  const [poolsMap, setPoolsMap] = useState<Record<UUID, Pool[]>>({});
  const [loadingPoolsFor, setLoadingPoolsFor] = useState<UUID | null>(null);
  const [winningPoolIds, setWinningPoolIds] = useState<Record<UUID, UUID>>({});

  const [resolvingId, setResolvingId] = useState<UUID | null>(null);
  const [successId, setSuccessId] = useState<UUID | null>(null);
  const [errorMap, setErrorMap] = useState<Record<UUID, string>>({});

  useEffect(() => {
    if (topics.length === 0) return;
    setLoadingEvents(true);
    Promise.all(topics.map((t) => fetchEvents(t.id)))
      .then((results) => {
        const all = results.flat().filter((e) => e.status !== "resolved");
        setEvents(all);
      })
      .catch(console.error)
      .finally(() => setLoadingEvents(false));
  }, [topics]);

  async function handleExpand(event: Event) {
    if (expandedEventId === event.id) {
      setExpandedEventId(null);
      return;
    }
    setExpandedEventId(event.id);
    if (poolsMap[event.id]) return;
    setLoadingPoolsFor(event.id);
    try {
      const pools = await fetchPools(event.id);
      setPoolsMap((prev) => ({ ...prev, [event.id]: pools }));
    } catch {
      setErrorMap((prev) => ({ ...prev, [event.id]: "Failed to load pools" }));
    } finally {
      setLoadingPoolsFor(null);
    }
  }

  async function handleResolve(event: Event) {
    const winningPoolId = winningPoolIds[event.id];
    if (!winningPoolId) return;
    setResolvingId(event.id);
    setErrorMap((prev) => ({ ...prev, [event.id]: "" }));
    setSuccessId(null);
    try {
      await resolveEvent(event.id, winningPoolId);
      setSuccessId(event.id);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    } catch (e) {
      setErrorMap((prev) => ({
        ...prev,
        [event.id]: e instanceof Error ? e.message : "Resolution failed",
      }));
    } finally {
      setResolvingId(null);
    }
  }

  if (loadingEvents) {
    return <CircularProgress />;
  }

  if (events.length === 0) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>Resolve Event</Typography>
        <Typography color="text.secondary">No open events to resolve.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Resolve Event</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select an event, pick the winning pool, and resolve it.
      </Typography>
      {events.map((event, i) => (
        <Box key={event.id}>
          <Box
            sx={{
              py: 1.5,
              px: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography fontWeight={600}>{event.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {event.status}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleExpand(event)}
            >
              {expandedEventId === event.id ? "Collapse" : "Resolve"}
            </Button>
          </Box>

          {expandedEventId === event.id && (
            <Box sx={{ pl: 2, pb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {loadingPoolsFor === event.id ? (
                <CircularProgress size={20} />
              ) : poolsMap[event.id]?.length > 0 ? (
                <>
                  <TextField
                    select
                    label="Winning Pool"
                    size="small"
                    value={winningPoolIds[event.id] ?? ""}
                    onChange={(e) =>
                      setWinningPoolIds((prev) => ({ ...prev, [event.id]: e.target.value as UUID }))
                    }
                    sx={{ maxWidth: 320 }}
                  >
                    {poolsMap[event.id].map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.entity?.name ?? p.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  {errorMap[event.id] && (
                    <Alert severity="error">{errorMap[event.id]}</Alert>
                  )}
                  {successId === event.id && (
                    <Alert severity="success">Resolved successfully.</Alert>
                  )}
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    sx={{ maxWidth: 160 }}
                    disabled={!winningPoolIds[event.id] || resolvingId === event.id}
                    onClick={() => handleResolve(event)}
                    startIcon={resolvingId === event.id ? <CircularProgress size={14} /> : null}
                  >
                    {resolvingId === event.id ? "Resolving..." : "Confirm Resolve"}
                  </Button>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">No pools found.</Typography>
              )}
            </Box>
          )}
          {i < events.length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  );
}