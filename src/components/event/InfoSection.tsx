import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import type { Event } from "../../models/models";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function InfoTab(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1.5, md: 3 } }}>{children}</Box>}
    </div>
  );
}

export function InfoSection({
  event,
  infoTabIdx,
  onChangeTab,
}: {
  event: Event;
  infoTabIdx: number;
  onChangeTab: (event: React.SyntheticEvent, newValue: number) => void;
}) {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={infoTabIdx} onChange={onChangeTab} aria-label="info tab">
            <Tab label="Rules" />
            <Tab label="Event Description" />
          </Tabs>
        </Box>
        <InfoTab value={infoTabIdx} index={0}>
          {event.resolutionRule}
        </InfoTab>
        <InfoTab value={infoTabIdx} index={1}>
          {event.description}
        </InfoTab>
      </Box>
    </>
  );
}
