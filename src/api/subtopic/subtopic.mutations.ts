import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UUID } from "../../models/models";
import { useAuth } from "@clerk/react";
import { createSubtopic, deleteSubtopic } from "./subtopic.api";
import { queryKeys } from "../queryKeys";

export function useSubtopicMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const createSubtopicMutation = useMutation({
    mutationFn: ({ topicId, name }: { topicId: UUID; name: string }) =>
      createSubtopic(topicId, name, getToken),
    onSuccess: (_, variables: { topicId: UUID; name: string }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics });
      queryClient.invalidateQueries({
        queryKey: queryKeys.topicEventCounts(variables.topicId),
      });
    },
  });

  const deleteSubtopicMutation = useMutation({
    mutationFn: (payload: { subtopicId: UUID; topicId: UUID }) =>
      deleteSubtopic(payload.subtopicId, getToken),
    onSuccess: (_, variables: { subtopicId: UUID; topicId: UUID }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics });
      queryClient.invalidateQueries({
        queryKey: queryKeys.topicEventCounts(variables.topicId),
      });
    },
  });

  return {
    createSubtopic: createSubtopicMutation.mutateAsync,
    isCreating: createSubtopicMutation.isPending,
    isCreated: createSubtopicMutation.isSuccess,
    createSubtopicError: createSubtopicMutation.isError,

    deleteSubtopic: deleteSubtopicMutation.mutateAsync,
    isDeleting: deleteSubtopicMutation.isPending,
    isDeleted: deleteSubtopicMutation.isSuccess,
    deleteSubtopicError: deleteSubtopicMutation.isError,
  };
}
