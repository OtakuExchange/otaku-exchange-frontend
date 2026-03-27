import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Stake } from "../api";
import { useApi } from "../hooks/useApi";
import { entityTextColor } from "../utils/entityTextColor";

export default function PortfolioView() {
  const { fetchMyStakes } = useApi();
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyStakes()
      .then(setStakes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 600 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Portfolio
      </Typography>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        Stakes
      </Typography>
      <Stack divider={<Divider />}>
        {loading ? (
          [0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: 2, my: 0.5 }} />
          ))
        ) : stakes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No stakes yet.
          </Typography>
        ) : (
          stakes.map((stake) => {
            const color = stake.entity?.color ?? "#1565c0";
            return (
              <Stack key={stake.id} direction="row" alignItems="center" spacing={1.5} sx={{ py: 1.5 }}>
                {stake.entity?.logoPath && (
                  <Box
                    component="img"
                    src={stake.entity.logoPath}
                    sx={{ width: 36, height: 36, borderRadius: 0.5, flexShrink: 0 }}
                  />
                )}
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: color + "26",
                    flexShrink: 0,
                  }}
                >
                  <Typography variant="body2" fontWeight={700} sx={{ color: entityTextColor(color) }}>
                    {stake.entity?.abbreviatedName ?? stake.label}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1 }}>
                  {stake.entity?.name ?? stake.label}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {(stake.amount / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </Typography>
              </Stack>
            );
          })
        )}
      </Stack>
    </Box>
  );
}
