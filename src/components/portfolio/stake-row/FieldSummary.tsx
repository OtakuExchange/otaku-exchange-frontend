import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PortfolioItem } from "../../../models/models";

function LogoStack({
  logoPaths,
  size = 18,
}: {
  logoPaths: Array<string | null | undefined>;
  size?: number;
}) {
  const shown = logoPaths.filter(Boolean).slice(0, 3) as string[];
  return (
    <Stack direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
      {shown.map((src, idx) => (
        <Box
          key={`${src}-${idx}`}
          component="img"
          src={src}
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            ml: idx === 0 ? 0 : -0.6,
            border: "2px solid rgba(255,255,255,0.12)",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
          }}
        />
      ))}
    </Stack>
  );
}

export function FieldSummary({
  opponents,
  totalPools,
}: {
  opponents: PortfolioItem[];
  totalPools: number;
}) {
  const top = [...opponents].sort((a, b) => b.volume - a.volume).slice(0, 3);
  const remaining = Math.max(0, opponents.length - top.length);
  const secondary =
    remaining > 0
      ? `${totalPools} pools · +${remaining}`
      : `${totalPools} pools`;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ minWidth: 0, justifyContent: "flex-end" }}
    >
      <Box sx={{ minWidth: 0, textAlign: "right" }}>
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
          Field
        </Typography>
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
      </Box>
      <LogoStack logoPaths={top.map((p) => p.entity?.logoPath)} />
    </Stack>
  );
}
