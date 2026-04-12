import Box from "@mui/material/Box";

export type PercentSegment = {
  key: string;
  pct: number;
  color: string;
};

function clampPct(pct: number) {
  if (!Number.isFinite(pct)) return 0;
  return Math.max(0, Math.min(100, pct));
}

export function MultiStakePercentBar({
  segments,
}: {
  segments: PercentSegment[];
}) {
  const cleaned = segments
    .map((s) => ({ ...s, pct: clampPct(s.pct) }))
    .filter((s) => s.pct > 0);

  const total = cleaned.reduce((sum, s) => sum + s.pct, 0);
  const normalized =
    total > 0
      ? cleaned.map((s) => ({ ...s, pct: (s.pct / total) * 100 }))
      : [];

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        height: 14,
      }}
    >
      {normalized.map((s, idx) => (
        <Box
          key={s.key}
          sx={{
            width: `${s.pct}%`,
            height: 10,
            bgcolor: s.color,
            borderRadius:
              idx === 0
                ? "6px 0 0 6px"
                : idx === normalized.length - 1
                  ? "0 6px 6px 0"
                  : 0,
          }}
        />
      ))}
    </Box>
  );
}

