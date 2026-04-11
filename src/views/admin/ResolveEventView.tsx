import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Event, Pool, UUID } from "../../models/models";
import {
  useMultiTopicEventsQuery,
  useTopicsQuery,
} from "../../api/topic/topic.queries";
import { useEventActionMutation } from "../../api/events/events.mutations";
import { usePoolsQuery } from "../../api/pool/pool.queries";

export default function ResolveEventView() {
  const { resolveEvent } = useEventActionMutation();
  const { data: topics = [], isLoading: topicsLoading } = useTopicsQuery();
  const topicIds = useMemo(() => topics.map((t) => t.id as UUID), [topics]);
  const { data: eventsByTopicData, isLoading: eventsLoading } =
    useMultiTopicEventsQuery(topicIds);
  const events = useMemo(
    () => eventsByTopicData.flat().filter((e) => e.status !== "resolved"),
    [eventsByTopicData],
  );

  const [expandedEventId, setExpandedEventId] = useState<UUID | null>(null);
  const {
    data: expandedPools,
    isLoading: expandedPoolsLoading,
    isError: expandedPoolsIsError,
  } = usePoolsQuery(expandedEventId);
  const [winningPoolIds, setWinningPoolIds] = useState<Record<UUID, UUID>>({});

  const [resolvingId, setResolvingId] = useState<UUID | null>(null);
  const [successId, setSuccessId] = useState<UUID | null>(null);
  const [errorMap, setErrorMap] = useState<Record<UUID, string>>({});

  function handleExpand(event: Event) {
    if (expandedEventId === event.id) {
      setExpandedEventId(null);
      return;
    }
    setExpandedEventId(event.id);
  }

  async function handleResolve(event: Event) {
    const winningPoolId = winningPoolIds[event.id];
    if (!winningPoolId) return;
    setResolvingId(event.id);
    setErrorMap((prev) => ({ ...prev, [event.id]: "" }));
    setSuccessId(null);
    try {
      await resolveEvent({
        eventId: event.id as UUID,
        topicId: event.topicId as UUID,
        winningPoolId: winningPoolId as UUID,
      });
      setSuccessId(event.id);
    } catch (e) {
      setErrorMap((prev) => ({
        ...prev,
        [event.id]: e instanceof Error ? e.message : "Resolution failed",
      }));
    } finally {
      setResolvingId(null);
    }
  }

  if (topicsLoading || eventsLoading) {
    return <CircularProgress />;
  }

  if (events.length === 0) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Resolve Event
        </Typography>
        <Typography color="text.secondary">
          No open events to resolve.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Resolve Event
      </Typography>
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
            <Box
              sx={{
                pl: 2,
                pb: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {expandedPoolsLoading ? (
                <CircularProgress size={20} />
              ) : expandedPoolsIsError ? (
                <Alert severity="error">Failed to load pools.</Alert>
              ) : (expandedPools ?? []).length > 0 ? (
                <>
                  <TextField
                    select
                    label="Winning Pool"
                    size="small"
                    value={winningPoolIds[event.id] ?? ""}
                    onChange={(e) =>
                      setWinningPoolIds((prev) => ({
                        ...prev,
                        [event.id]: e.target.value as UUID,
                      }))
                    }
                    sx={{ maxWidth: 320 }}
                  >
                    {(expandedPools ?? []).map((p: Pool) => (
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
                    disabled={
                      !winningPoolIds[event.id] || resolvingId === event.id
                    }
                    onClick={() => handleResolve(event)}
                    startIcon={
                      resolvingId === event.id ? (
                        <CircularProgress size={14} />
                      ) : null
                    }
                  >
                    {resolvingId === event.id
                      ? "Resolving..."
                      : "Confirm Resolve"}
                  </Button>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No pools found.
                </Typography>
              )}
            </Box>
          )}
          {i < events.length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  );
}
