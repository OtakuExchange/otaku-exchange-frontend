import { useAuth } from "@clerk/react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { type CreateEntityPayload, createEntity } from "./entity.api";
import { queryKeys } from "../queryKeys";

export function useEntityMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const createEntityMutation = useMutation({
    mutationFn: (payload: CreateEntityPayload) => createEntity(payload, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entities });
    },
  });

  return {
    createEntity: createEntityMutation.mutateAsync,
    isCreating: createEntityMutation.isPending,
    isCreated: createEntityMutation.isSuccess,
    createEntityError: createEntityMutation.isError,
  };
}