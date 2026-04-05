import type { Topic, UUID } from "../../models/models";
import { useLocation } from "react-router-dom";

export interface NavTab {
  id: UUID;
  label: string;
  path: string;
  subtopics: Topic["subtopics"];
}

interface UseNavbarTopicsResult {
  navTabs: NavTab[];
  activeTab: string | false;
}

export function useNavbarTopics({
  topics,
  effectiveIsAdmin,
}: {
  topics: Topic[];
  effectiveIsAdmin: boolean;
}): UseNavbarTopicsResult {
  const location = useLocation();
  const navTabs: NavTab[] = topics
    .filter((topic) => !topic.hidden || effectiveIsAdmin)
    .map((topic) => ({
      id: topic.id,
      label: topic.topic,
      path: `/${topic.topic.toLowerCase().replace(/\s+/g, "-")}`,
      subtopics: topic.subtopics,
    }));
  const activeTab =
    navTabs.find((tab) => location.pathname.startsWith(tab.path))?.path ||
    false;

  return {
    navTabs,
    activeTab,
  };
}
