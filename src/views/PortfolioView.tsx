import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { usePortfolioQuery } from "../api/portfolio/portfolio.queries";
import { PortfolioStakeSections } from "../components/portfolio/PortfolioStakeSections";

export default function PortfolioView() {
  const { data, isLoading: loading } = usePortfolioQuery();

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Portfolio
      </Typography>
      <PortfolioStakeSections items={data?.pools ?? []} loading={loading} />
    </Box>
  );
}
