import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useState, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";

type InfoBannerProps = {
  storageKey: string;
  message: React.ReactNode;
  variant?: "info" | "warning";
};

export function InfoBanner({
  storageKey,
  message,
  variant = "info",
}: InfoBannerProps) {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(`hideInfoBanner:${storageKey}`) === "true";
    } catch {
      return false;
    }
  });

  const handleDismiss = useCallback(() => {
    setHidden(true);
    try {
      localStorage.setItem(`hideInfoBanner:${storageKey}`, "true");
    } catch {}
  }, [storageKey]);

  if (hidden) return null;

  const styles = {
    info: {
      bgcolor: "rgba(123, 137, 150, 0.08)",
      color: "#7B8996",
    },
    warning: {
      bgcolor: "rgba(255, 82, 82, 0.08)",
      borderColor: "error.main",
      color: "error.main",
    },
  }[variant];

  return (
    <Box
      sx={{
        ...styles,
        px: 2,
        py: 1.25,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        borderRadius: 1,
      }}
    >
      <Box sx={{ flex: 1 }}>
        {typeof message === "string" ? (
          <Typography sx={{ fontSize: 13 }}>{message}</Typography>
        ) : (
          message
        )}
      </Box>

      <IconButton
        size="small"
        aria-label="Dismiss banner"
        onClick={handleDismiss}
        sx={{ color: "inherit", opacity: 0.7 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
