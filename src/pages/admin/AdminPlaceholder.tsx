// src/pages/Admin/AdminPlaceholder.tsx
import { FaTools } from "react-icons/fa";

export default function AdminPlaceholder() {
    return (
        <section className="min-h-screen bg-primary/10 p-8">
            <div className="glass mx-auto max-w-4xl p-8 text-center">
                <h1 className="mb-4 text-3xl font-bold text-white">
                    <FaTools className="inline-block mr-2" />
                    Admin Panel (Coming Soon)
                </h1>
                <p className="text-white/80">
                    You have successfully logged in as an administrator. From here you
                    will be able to manage users, approve deposits/withdrawals, view
                    system logs, and more.
                </p>
            </div>
        </section>
    );
}