"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Exam, Progress, ProgressStatus, Syllabus } from "@/types";

export const queryKeys = {
  exams: ["exams"] as const,
  syllabus: (id: number) => ["syllabus", id] as const,
  progress: ["my-progress"] as const,
};

export function useExams() {
  return useQuery({ queryKey: queryKeys.exams, queryFn: () => api<Exam[]>("/api/exams") });
}

export function useSyllabus(id: number) {
  return useQuery({ queryKey: queryKeys.syllabus(id), queryFn: () => api<Syllabus>(`/api/exams/${id}/syllabus`), enabled: Number.isFinite(id) && id > 0 });
}

export function useMyProgress(enabled = true) {
  return useQuery({ queryKey: queryKeys.progress, queryFn: () => api<Progress[]>("/api/me/progress"), enabled, retry: false });
}

export function useSetProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, status }: { topicId: number; status: ProgressStatus }) =>
      api<Progress>(`/api/me/progress/${topicId}`, { method: "PUT", body: JSON.stringify({ status }) }),
    onMutate: async ({ topicId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.progress });
      const previous = queryClient.getQueryData<Progress[]>(queryKeys.progress) || [];
      const optimistic: Progress = { topicId, topicName: "", status, updatedAt: new Date().toISOString() };
      queryClient.setQueryData<Progress[]>(queryKeys.progress, [...previous.filter((item) => item.topicId !== topicId), optimistic]);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(queryKeys.progress, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.progress }),
  });
}
