import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useUser } from "@clerk/react";
import { Navigate, Outlet } from "react-router-dom";

export function SignedInGuard() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
