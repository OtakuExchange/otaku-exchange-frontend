import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useEntityMutation } from "../../api/entity/entity.mutations";

export default function CreateEntityView() {
  const { createEntity, isCreating: loading, createEntityError: error, isCreated: success } = useEntityMutation();
  const [name, setName] = useState("");
  const [abbreviatedName, setAbbreviatedName] = useState("");
  const [logoPath, setLogoPath] = useState("");
  const [color, setColor] = useState("");

  async function handleSubmit() {
    try {
      await createEntity({
        name: name.trim(),
        abbreviatedName: abbreviatedName.trim() || undefined,
        logoPath: logoPath.trim(),
        color: color.trim() || undefined,
      });
      setName("");
      setAbbreviatedName("");
      setLogoPath("");
      setColor("");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}
    >
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
      {success && (
        <Alert severity="success">Entity created successfully.</Alert>
      )}
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
