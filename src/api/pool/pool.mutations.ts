import { useAuth } from "@clerk/react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { UUID } from "../../models/models";
import { createMarketPool } from "./pool.api";
import { queryKeys } from "../queryKeys";

export function usePoolMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const createPoolMutation = useMutation({
    mutationFn: (payload: {
      eventId: UUID;
      label: string;
      entityId: UUID | null;
    }) =>
      createMarketPool(
        payload.eventId,
        payload.label,
        payload.entityId,
        getToken,
      ),
    onSuccess: (
      _,
      variables: { eventId: UUID; label: string; entityId: UUID | null },
    ) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.poolsByEventId(variables.eventId),
      });
    },
  });

  return {
    createMarketPool: createPoolMutation.mutateAsync,
    isCreating: createPoolMutation.isPending,
    isCreated: createPoolMutation.isSuccess,
    createMarketPoolError: createPoolMutation.isError,
  };
}
