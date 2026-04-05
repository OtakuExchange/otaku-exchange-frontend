import AppBar from "@mui/material/AppBar";

export function TopNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={{
        bgcolor: "#16191d",
        borderBottom: 1,
        borderColor: "#252b31",
      }}
    >
      {children}
    </AppBar>
  );
}
