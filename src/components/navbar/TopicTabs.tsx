import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import type { NavTab } from "./useNavbarTopics";
import { useNavigate } from "react-router-dom";

export function TopicTabs({
  activeTab,
  navTabs,
}: {
  activeTab: string | false;
  navTabs: NavTab[];
}) {
  const navigate = useNavigate();

  return (
    <Tabs
      value={activeTab}
      onChange={(_, nextPath: string) => navigate(nextPath)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      textColor="inherit"
      slotProps={{ indicator: { style: { display: "none" } } }}
    >
      {navTabs.map((tab) => (
        <Tab key={tab.path} value={tab.path} label={tab.label} />
      ))}
    </Tabs>
  );
}
