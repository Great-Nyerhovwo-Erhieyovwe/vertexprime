// src/pages/Admin/AdminLogin.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { InputField } from "../../components/Form/InputField";
import { motion } from "framer-motion";

/* -----------------------------------------------------------------
   AdminLogin – behaves like the normal login but enforces the admin
   role after the JWT is obtained.
   ----------------------------------------------------------------- */
export default function AdminLogin() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [serverError, setServerError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
    setServerError("");
  };

  const validate = () => {
    const newErr: typeof errors = {};
    if (!form.email) newErr.email = "Email required.";
    if (!form.password) newErr.password = "Password required.";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const loginMutation = useMutation<any, Error, { email: string; password: string }>({
    mutationFn: async (payload) =>
      api.post("/api/auth/login", payload),
    onSuccess: async (res: any) => {
      // Store JWT
      const token = res.data.token;
      localStorage.setItem("token", token);

      // Immediately fetch the user profile to inspect the role
      const { data: user } = await api.get("/api/user/me");

      if (user.role !== "admin") {
        // Not an admin – clear token and show error
        localStorage.removeItem("token");
        setServerError(
          "Your account does not have admin privileges. Please use the regular login."
        );
        return;
      }

      // Admin role confirmed – invalidate any stale queries
      qc.invalidateQueries({ queryKey: ["me"] });

      // Redirect to the admin dashboard
      navigate("/admin", { replace: true });
    },
    onError: () => {
      setServerError("Invalid credentials – please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    loginMutation.mutate(form);
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-primary">
      <div className="glass w-full max-w-md p-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">
          Admin Login
        </h2>

        {serverError && (
          <p className="mb-4 rounded bg-red-900 p-2 text-center text-sm text-red-200">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <motion.button
            type="submit"
            className="mt-4 w-full rounded-md bg-accent py-2 font-medium text-primary hover:bg-accent/90"
            whileHover={{ scale: 1.02 }}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in…" : "Sign In as Admin"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-white/80">
          Not an admin?{" "}
          <Link to="/login" className="hover:text-accent">
            Use the regular user login
          </Link>
        </p>
      </div>
    </section>
  );
}