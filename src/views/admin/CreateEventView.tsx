import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { EVENT_STATUSES, type Topic } from "../../models/models";
import { useApi } from "../../hooks/useApi";
import { useTopics } from "../../contexts/TopicsContext";

const FORMAT_OPTIONS = ["binary", "multi"];

export default function CreateEventView() {
  const { createEvent } = useApi();
  const topics = useTopics();
  const [topicId, setTopicId] = useState("");
  const [format, setFormat] = useState("binary");
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [description, setDescription] = useState("");
  const [closeTime, setCloseTime] = useState<Dayjs | null>(null);
  const [status, setStatus] = useState("open");
  const [resolutionRule, setResolutionRule] = useState("");
  const [logoPath, setLogoPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createEvent({
        topicId: topicId as Topic["id"],
        format,
        name,
        alias,
        description,
        closeTime: closeTime!.toISOString(),
        status,
        resolutionRule,
        logoPath: logoPath.trim() || undefined,
      });
      setSuccess(true);
      setName("");
      setDescription("");
      setCloseTime(null);
      setResolutionRule("");
      setLogoPath("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    !loading && !!topicId && !!name.trim() && !!closeTime?.isValid();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}
      >
        <Typography variant="h5">Create Event</Typography>
        <TextField
          select
          label="Topic"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
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
          label="Format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          disabled={loading}
        >
          {FORMAT_OPTIONS.map((f) => (
            <MenuItem key={f} value={f}>
              {f}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <TextField
          label="Alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          disabled={loading}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          disabled={loading}
        />
        <TextField
          label="Logo URL"
          value={logoPath}
          onChange={(e) => setLogoPath(e.target.value)}
          disabled={loading}
          placeholder="https://..."
        />
        <DateTimePicker
          label="Close Time"
          value={closeTime}
          onChange={(val) => setCloseTime(val)}
          minDateTime={dayjs()}
          disabled={loading}
        />
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
        >
          {EVENT_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Resolution Rule"
          value={resolutionRule}
          onChange={(e) => setResolutionRule(e.target.value)}
          multiline
          rows={2}
          disabled={loading}
        />
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="success.main" variant="body2">
            Event created successfully.
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Add Event
        </Button>
      </Box>
    </LocalizationProvider>
  );
}
