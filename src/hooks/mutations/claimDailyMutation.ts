import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimDailyReward } from "../../api";
import { useAuth } from "@clerk/react";
import { queryKeys } from "../queryKeys";

export function useClaimDailyMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => claimDailyReward(getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });

  return {
    claimDailyReward: mutation.mutateAsync,
    isClaiming: mutation.isPending,
    isClaimed: mutation.isSuccess,
    isError: mutation.isError,
  }
}