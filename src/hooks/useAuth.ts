import { useMutation } from "@tanstack/react-query";
import { api } from "../api/client";

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("token");
      return { success: true };
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      window.location.href = "/admin/login";
    },
  });
}

export function useCurrentUser() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get("/api/user/me");
      return data;
    },
  });
}
