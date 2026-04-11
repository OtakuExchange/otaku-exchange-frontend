import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTopicMutation } from "../../api/topic/topic.mutations";

export default function CreateTopicView() {
  const {
    createTopic,
    isCreating: loading,
    createTopicError: error,
    isCreated: success,
  } = useTopicMutation();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [hidden, setHidden] = useState(false);

  async function handleSubmit() {
    try {
      await createTopic({ topic, description, hidden });
      setTopic("");
      setDescription("");
      setHidden(false);
    } catch {
      console.error("Failed to create topic");
    }
  }, [success]);

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
