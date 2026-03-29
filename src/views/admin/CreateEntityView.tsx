import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useApi } from "../../hooks/useApi";

export default function CreateEntityView() {
  const { createEntity } = useApi();
  const [name, setName] = useState("");
  const [abbreviatedName, setAbbreviatedName] = useState("");
  const [logoPath, setLogoPath] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createEntity({
        name: name.trim(),
        abbreviatedName: abbreviatedName.trim() || undefined,
        logoPath: logoPath.trim(),
        color: color.trim() || undefined,
      });
      setSuccess(true);
      setName("");
      setAbbreviatedName("");
      setLogoPath("");
      setColor("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create entity");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}>
      <Typography variant="h5">Create Entity</Typography>
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />
      <TextField
        label="Abbreviated Name"
        value={abbreviatedName}
        onChange={(e) => setAbbreviatedName(e.target.value)}
        disabled={loading}
        placeholder="e.g. TSM"
      />
      <TextField
        label="Logo URL"
        value={logoPath}
        onChange={(e) => setLogoPath(e.target.value)}
        disabled={loading}
        placeholder="https://..."
      />
      <TextField
        label="Color (hex)"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        disabled={loading}
        placeholder="#1565c0"
      />
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Entity created successfully.</Alert>}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading || !name.trim() || !logoPath.trim()}
      >
        Add Entity
      </Button>
    </Box>
  );
}