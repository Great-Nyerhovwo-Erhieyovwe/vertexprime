// src/hooks/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

/* -----------------------------------------------------------------
   Types
----------------------------------------------------------------- */
export type User = {
    id: number;
    email: string;
    role: "admin" | "trader" | "viewer";
    createdAt: string;
    // optional fields you may want to expose
    balanceUsd?: number;
    roi?: number;
};

export type UpgradePlan = {
    id: number;
    name: string;          // e.g. "Lumo Plus"
    priceMonthly: number;  // USD
    priceAnnual: number;   // USD
    features: string[];    // description bullets
};

/* -----------------------------------------------------------------
   USERS
----------------------------------------------------------------- */
// GET all users
export const useUsers = () =>
    useQuery({
        queryKey: ["admin", "users"],
        queryFn: async () => {
            const { data } = await api.get("/api/admin/users");
            return data;
        }
    });

// CREATE a new user (admin can set a temporary password)
export const useCreateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { email: string; password: string; role?: "admin" | "trader" | "viewer" }) =>
            api.post("/api/admin/users", payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    });
};

// UPDATE user fields (email, role, etc.)
export const useUpdateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: Partial<Omit<User, "id">> }) =>
            api.patch(`/api/admin/users/${id}`, updates),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    });
};

// CHANGE password (admin‑only operation)
export const useChangeUserPassword = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
            api.post(`/api/admin/users/${id}/password`, { newPassword }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    });
};

// DELETE a user
export const useDeleteUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: number }) => api.delete(`/api/admin/users/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    });
};

/* -----------------------------------------------------------------
   UPGRADE PLANS
----------------------------------------------------------------- */
// GET all upgrade plans
export const useUpgradePlans = () =>
    useQuery({
        queryKey: ["admin", "plans"],
        queryFn: async () => {
            const { data } = await api.get("/api/admin/plans");
            return data;
        }
    });

// CREATE a new plan
export const useCreatePlan = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Omit<UpgradePlan, "id">) => api.post("/api/admin/plans", payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "plans"] }),
    });
};

// UPDATE an existing plan
export const useUpdatePlan = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: Partial<Omit<UpgradePlan, "id">> }) =>
            api.patch(`/api/admin/plans/${id}`, updates),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "plans"] }),
    });
};

// DELETE a plan
export const useDeletePlan = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: number }) => api.delete(`/api/admin/plans/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "plans"] }),
    });
};