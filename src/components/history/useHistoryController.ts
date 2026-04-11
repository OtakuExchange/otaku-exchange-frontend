import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Event, Subtopic, Topic, UUID } from "../../models/models";
import {
  useMultiTopicEventsQuery,
  useTopicEventsQuery,
} from "../../api/topic/topic.queries";
import { useHistoryEventFilters } from "./useHistoryEventFilters";
import { usePoolsVolumesByEventIds } from "./usePoolsVolumesByEventIds";

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function useHistoryController(topics: Topic[]) {
  const navigate = useNavigate();
  const { topicSlug, "*": subtopicSlug } = useParams();

  const filters = useHistoryEventFilters();

  const topicIds = useMemo(() => topics.map((t) => t.id as UUID), [topics]);

  const selectedTopic: Topic | null = useMemo(() => {
    if (topicSlug === "all") return null;
    return topics.find((t) => toSlug(t.topic) === topicSlug) ?? null;
  }, [topics, topicSlug]);

  const topicValue: "all" | UUID = selectedTopic ? selectedTopic.id : "all";

  const selectedSubtopicId: UUID | null = useMemo(() => {
    if (!selectedTopic) return null;
    if (!subtopicSlug) return null; // All divisions
    return (
      selectedTopic.subtopics.find((s) => toSlug(s.name) === subtopicSlug)?.id ??
      null
    );
  }, [selectedTopic, subtopicSlug]);

  const divisionValue: "" | UUID =
    selectedTopic && selectedSubtopicId ? selectedSubtopicId : "";

  const subtopics: Subtopic[] = selectedTopic?.subtopics ?? [];

  const {
    data: topicEvents,
    isLoading: topicEventsLoading,
    error: topicEventsError,
  } = useTopicEventsQuery(
    (selectedTopic?.id ?? "") as UUID | "",
    selectedSubtopicId,
  );

  const {
    data: allEventsByTopic,
    isLoading: allEventsLoading,
    isError: allEventsIsError,
  } = useMultiTopicEventsQuery(topicValue === "all" ? topicIds : []);

  useEffect(() => {
    // Normalize invalid topic slugs back to /history/all
    if (!topicSlug) return;
    if (topicSlug === "all") return;
    if (!selectedTopic) {
      navigate("/history/all", { replace: true });
    }
  }, [navigate, selectedTopic, topicSlug]);

  const sourceEvents: Event[] = useMemo(() => {
    if (topicValue === "all") return allEventsByTopic.flat();
    return topicEvents ?? [];
  }, [allEventsByTopic, topicEvents, topicValue]);

  const filteredEvents = useMemo(
    () => filters.filter(sourceEvents),
    [filters, sourceEvents],
  );

  const volumeSortEnabled =
    filters.sortOption === "volume_desc" || filters.sortOption === "volume_asc";

  const volumeSortEventIds = useMemo(
    () => (volumeSortEnabled ? filteredEvents.map((e) => e.id as UUID) : []),
    [filteredEvents, volumeSortEnabled],
  );

  const { volumeByEventId } = usePoolsVolumesByEventIds(
    volumeSortEventIds,
    volumeSortEnabled,
  );

  const resolvedEvents = useMemo(
    () => filters.sort(filteredEvents, { volumeByEventId }),
    [filters, filteredEvents, volumeByEventId],
  );

  const isLoading =
    topicValue === "all" ? allEventsLoading : topicEventsLoading;
  const error =
    topicValue === "all" ? allEventsIsError : Boolean(topicEventsError);

  function setTopic(next: "all" | UUID) {
    if (next === "all") {
      navigate("/history/all");
      return;
    }
    const nextTopic = topics.find((t) => t.id === next);
    if (!nextTopic) return;
    navigate(`/history/${toSlug(nextTopic.topic)}`);
  }

  function setDivision(next: "" | UUID) {
    if (!selectedTopic) return;
    if (!next) {
      navigate(`/history/${toSlug(selectedTopic.topic)}`);
      return;
    }
    const sub = subtopics.find((s) => s.id === next);
    if (!sub) return;
    navigate(`/history/${toSlug(selectedTopic.topic)}/${toSlug(sub.name)}`);
  }

  function clearAll() {
    filters.clearFilters();
    navigate("/history/all");
  }

  return {
    topicValue,
    subtopics,
    divisionValue,

    sortOption: filters.sortOption,
    setSortOption: filters.setSortOption,
    multiplierFilter: filters.multiplierFilter,
    setMultiplierFilter: filters.setMultiplierFilter,

    resolvedEvents,
    resultsCount: resolvedEvents.length,

    isLoading,
    error,

    setTopic,
    setDivision,
    clearAll,

    topicEventsError,
    topicEventsLoading,
    allEventsLoading,
    allEventsIsError,
  };
}

