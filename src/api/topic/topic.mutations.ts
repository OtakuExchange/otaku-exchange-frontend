import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { queryKeys } from "../queryKeys";
import { createTopic, deleteTopic } from "./topic.api";
import type { UUID } from "../../models/models";

export function useTopicMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const createTopicMutation = useMutation({
    mutationFn: ({ topic, description, hidden }: { topic: string; description: string; hidden: boolean }) =>
      createTopic(topic, description, hidden, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics });
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: (topicId: UUID) => deleteTopic(topicId, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics });
    },
  });

  return {
    createTopic: createTopicMutation.mutateAsync,
    isCreating: createTopicMutation.isPending,
    isCreated: createTopicMutation.isSuccess,
    createTopicError: createTopicMutation.isError,
    
    deleteTopic: deleteTopicMutation.mutateAsync,
    isDeleting: deleteTopicMutation.isPending,
    isDeleted: deleteTopicMutation.isSuccess,
    deleteTopicError: deleteTopicMutation.isError,
  };
}

