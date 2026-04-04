import Box from "@mui/material/Box";

export function StakePercentBar({
  leftPct,
  leftColor,
  rightColor = "#3d4550",
}: {
  leftPct: number;
  leftColor: string;
  rightColor?: string;
}) {
  const safe = Number.isFinite(leftPct) ? Math.max(0, Math.min(100, leftPct)) : 0;
  const rightPct = 100 - safe;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        height: 14,
      }}
    >
      <Box
        sx={{
          width: `${safe}%`,
          height: 10,
          bgcolor: leftColor,
          borderRadius: "6px 0 0 6px",
        }}
      />
      <Box
        sx={{
          width: `${rightPct}%`,
          height: 6,
          bgcolor: rightColor,
          borderRadius: "0 6px 6px 0",
        }}
      />
    </Box>
  );
}

