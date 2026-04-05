import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useApi } from "../../hooks/useApi";

export default function CreateTopicView() {
  const { createTopic } = useApi();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createTopic(topic, description, hidden);
      setSuccess(true);
      setTopic("");
      setDescription("");
      setHidden(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create topic");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}
    >
      <Typography variant="h5">Create Topic</Typography>
      <TextField
        label="Name"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
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
      <FormControlLabel
        control={
          <Switch
            checked={hidden}
            onChange={(e) => setHidden(e.target.checked)}
            disabled={loading}
          />
        }
        label="Hidden"
      />
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      {success && (
        <Typography color="success.main" variant="body2">
          Topic created successfully.
        </Typography>
      )}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading || !topic.trim()}
      >
        Add Topic
      </Button>
    </Box>
  );
}
