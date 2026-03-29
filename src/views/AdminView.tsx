import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GrassIcon from "@mui/icons-material/Grass";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/react";
import { useApi } from "../hooks/useApi";
import CreateTopicView from "./admin/CreateTopicView";
import CreateEventView from "./admin/CreateEventView";
import CreateMarketView from "./admin/CreateMarketView";
import DeleteView from "./admin/DeleteView";
import type { UUID } from "../models/models";
import ResolveEventView from "./admin/ResolveEventView";
import CreateEntityView from "./admin/CreateEntityView";
import EventStatusView from "./admin/EventStatusView";

function AdminSidebar() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [seedOpen, setSeedOpen] = useState(false);

  return (
    <Box
      sx={{
        width: 220,
        flexShrink: 0,
        borderRight: 1,
        borderColor: "divider",
        minHeight: "100%",
      }}
    >
      <List dense disablePadding>
        <ListItemButton onClick={() => setCreateOpen((o) => !o)}>
          <AddCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          <ListItemText primary="Create" />
          {createOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={createOpen} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => navigate("/admin/create/topic")}
            >
              <ListItemText primary="Topic" />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => navigate("/admin/create/event")}
            >
              <ListItemText primary="Event" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate("/admin/create/entity")}>
              <ListItemText primary="Entity" />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => navigate("/admin/create/market")}
            >
              <ListItemText primary="Market" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton onClick={() => setDeleteOpen((o) => !o)}>
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          <ListItemText primary="Delete" />
          {deleteOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={deleteOpen} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => navigate("/admin/delete")}
            >
              <ListItemText primary="Topic / Event / Market" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton sx={{ pl: 4 }} onClick={() => navigate("/admin/resolve/event")}>
          <ListItemText primary="Resolve Event" />
        </ListItemButton>

        <ListItemButton sx={{ pl: 4 }} onClick={() => navigate("/admin/event-status")}>
          <ListItemText primary="Event Visibility" />
        </ListItemButton>

        <ListItemButton onClick={() => setSeedOpen((o) => !o)}>
          <GrassIcon fontSize="small" sx={{ mr: 1 }} />
          <ListItemText primary="Seed" />
          {seedOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={seedOpen} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => navigate("/admin/seed/market")}
            >
              <ListItemText primary="Seed Market" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Box>
  );
}

function SeedMarketView() {
  const { seedMarket } = useApi();
  const [marketId, setMarketId] = useState("");
  const [midpoint, setMidpoint] = useState("50");
  const [useLastPrice, setUseLastPrice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSeed = async () => {
    if (!marketId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const message = await seedMarket(marketId.trim() as UUID, {
        midpoint: parseInt(midpoint),
        useLastPrice,
      });
      setResult({ success: true, message });
    } catch (e) {
      setResult({ success: false, message: "Failed to seed market" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h6" gutterBottom>
        Seed Market
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Places YES and NO limit orders around a midpoint price to provide
        initial liquidity.
      </Typography>
      <TextField
        label="Market ID"
        value={marketId}
        onChange={(e) => setMarketId(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        placeholder="e.g. 3b9d8102-06ce-4f64-a772-27425901f57e"
      />
      <TextField
        label="Midpoint (cents, 1–99)"
        value={midpoint}
        onChange={(e) => setMidpoint(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        helperText="Center YES price. Default 50 = neutral. Set higher if YES is more likely."
        disabled={useLastPrice}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Button
          variant={useLastPrice ? "contained" : "outlined"}
          size="small"
          onClick={() => setUseLastPrice((v) => !v)}
        >
          {useLastPrice ? "Using last traded price" : "Use last traded price"}
        </Button>
        <Typography variant="caption" color="text.secondary">
          Recommended for reseeds on active markets
        </Typography>
      </Box>
      <Button
        variant="contained"
        onClick={handleSeed}
        disabled={loading || !marketId.trim()}
        startIcon={loading ? <CircularProgress size={16} /> : <GrassIcon />}
      >
        {loading ? "Seeding..." : "Seed Market"}
      </Button>
      {result && (
        <Alert severity={result.success ? "success" : "error"} sx={{ mt: 2 }}>
          {result.message}
        </Alert>
      )}
    </Box>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const { fetchCurrentUser } = useApi();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    console.log(
      "[AdminGuard] isLoaded:",
      isLoaded,
      "| isSignedIn:",
      isSignedIn,
    );
    if (!isLoaded) return;
    if (!isSignedIn) {
      console.log("[AdminGuard] Not signed in — blocking access");
      setIsAdmin(false);
      return;
    }
    fetchCurrentUser()
      .then((user) => {
        console.log("[AdminGuard] /users/me response:", user);
        console.log("[AdminGuard] isAdmin:", user?.isAdmin);
        setIsAdmin(user?.isAdmin ?? false);
      })
      .catch((err) => {
        console.error("[AdminGuard] fetchCurrentUser error:", err);
        setIsAdmin(false);
      });
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || isAdmin === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isSignedIn || !isAdmin) {
    console.log("[AdminGuard] Access denied — redirecting to /");
    return <Navigate to="/" replace />;
  }

  console.log("[AdminGuard] Access granted");
  return <>{children}</>;
}

export default function AdminView() {
  return (
    <AdminGuard>
      <Box sx={{ display: "flex", minHeight: "100%" }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
          <Typography variant="h4" gutterBottom>
            Administration
          </Typography>
          <Routes>
            <Route path="create/topic" element={<CreateTopicView />} />
            <Route path="create/event" element={<CreateEventView />} />
            <Route path="create/market" element={<CreateMarketView />} />
            <Route path="create/entity" element={<CreateEntityView />} />
            <Route path="delete" element={<DeleteView />} />
            <Route path="event-status" element={<EventStatusView />} />
            <Route path="seed/market" element={<SeedMarketView />} />
            <Route
              path="*"
              element={<Navigate to="/admin/create/topic" replace />}
            />
            <Route path="resolve/event" element={<ResolveEventView />} />
          </Routes>
        </Box>
      </Box>
    </AdminGuard>
  );
}
