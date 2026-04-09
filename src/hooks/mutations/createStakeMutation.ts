import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStake } from "../../api";
import type { UUID } from "../../models/models";
import { useAuth } from "@clerk/react";
import { queryKeys } from "../queryKeys";

export function useCreateStakeMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ marketPoolId, amount }: { marketPoolId: UUID; amount: number }) => createStake(marketPoolId, amount, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
    },
  });

  return {
    createStake: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isCreated: mutation.isSuccess,
    isError: mutation.isError,
  }
}