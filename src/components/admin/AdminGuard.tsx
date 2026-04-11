import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useUser } from "@clerk/react";
import { Navigate } from "react-router-dom";
import { useUserQuery } from "../../api/user/user.queries";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const { data: userData, isLoading: isLoadingUser } = useUserQuery();
  const effectiveIsAdmin = isSignedIn === true && (userData?.isAdmin ?? false);

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

  if (isLoadingUser) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!effectiveIsAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

