import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Navbar } from "./Navbar";
import { TopicTabs } from "./TopicTabs";
import type { NavTab } from "./useNavbarTopics";

export function TopNavLayout({
  isSignedIn,
  effectiveIsAdmin,
  cash,
  activeTab,
  navTabs,
}: {
  isSignedIn: boolean;
  effectiveIsAdmin: boolean;
  cash: number | null;
  activeTab: string | false;
  navTabs: NavTab[];
}) {
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
      <Toolbar>
        <Navbar
          isSignedIn={isSignedIn}
          effectiveIsAdmin={effectiveIsAdmin}
          cash={cash}
        />
      </Toolbar>
      <TopicTabs activeTab={activeTab} navTabs={navTabs} />
    </AppBar>
  );
}
