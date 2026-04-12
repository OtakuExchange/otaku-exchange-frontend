import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function TeamBadge({
  logoPath,
  primary,
  secondary,
  align = "left",
}: {
  logoPath?: string | null;
  primary: string;
  secondary?: string | null;
  align?: "left" | "right";
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
      {logoPath ? (
        <Box
          component="img"
          src={logoPath}
          sx={{ width: 32, height: 32, borderRadius: 0.5, flexShrink: 0 }}
        />
      ) : (
        <Box sx={{ width: 32, height: 32, flexShrink: 0 }} />
      )}
      <Box sx={{ minWidth: 0, textAlign: align }}>
        <Typography
          variant="body2"
          fontWeight={800}
          sx={{
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {primary}
        </Typography>
        {secondary && (
          <Typography
            variant="caption"
            sx={{
              color: "#7B8996",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
          >
            {secondary}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

