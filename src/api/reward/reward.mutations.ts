import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { queryKeys } from "../queryKeys";
import { claimDailyReward } from "./reward.api";

export function useClaimDailyMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => claimDailyReward(getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyStreak });
    },
  });

  return {
    claimDailyReward: mutation.mutateAsync,
    isClaiming: mutation.isPending,
    isClaimed: mutation.isSuccess,
    isError: mutation.isError,
  };
}
