import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { useAuth, User } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

function normalizePhone(phone: string) {
    return phone.trim().replace(/[()\s-]/g, "");
}

function isValidPhone(phone: string) {
    return /^[0-9]{10}$/.test(phone);
}

export const Route = createFileRoute("/profile")({
    head: () => ({
        meta: [{ title: "My Profile — Morfyx Studio" }],
    }),
    component: ProfilePage,
});

function ProfilePage() {
    const navigate = useNavigate();
    const { isAuthenticated, user, login, logout } = useAuth();
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: "/login" });
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await api.getMe();
                if (response?.data?.user) {
                    if (response.data.user.role === "admin") {
                        logout();
                        navigate({ to: "/login" });
                        return;
                    }

                    setUserData(response.data.user);
                    setEditForm({
                        name: response.data.user.name,
                        email: response.data.user.email,
                        phone: response.data.user.phone || "",
                    });
                }
            } catch (err: any) {
                setError(err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        logout();
        navigate({ to: "/" });
    };

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        if (!editForm.name.trim()) {
            setError("Name is required");
            return;
        }

        const normalizedPhone = normalizePhone(editForm.phone);
        if (normalizedPhone && !isValidPhone(normalizedPhone)) {
            setError("Enter a valid 10-digit phone number");
            return;
        }

        try {
            setSaving(true);
            const response = await api.updateMe({
                name: editForm.name.trim(),
                phone: normalizedPhone,
            });

            const updatedUser = response?.data?.user;
            if (!updatedUser) {
                throw new Error("Invalid response from server");
            }

            setUserData(updatedUser);
            setEditForm({
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone || "",
            });
            login(updatedUser);
            setEditMode(false);
            toast.success("Profile updated successfully");
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (!isAuthenticated) return null;

    if (loading) {
        return (
            <PageShell>
                <PageHero eyebrow="Account" title="My Profile" desc="Manage your account information and preferences." />
                <section className="pb-24">
                    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                        <div className="glass neon-border rounded-3xl p-8 text-center">
                            <div className="text-lg text-muted-foreground">Loading...</div>
                        </div>
                    </div>
                </section>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <PageHero eyebrow="Account" title="My Profile" desc="Manage your account information and preferences." />

            <section className="pb-24">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {error && (
                        <div className="glass neon-border rounded-3xl p-4 mb-6 border-red-500/20 bg-red-500/5">
                            <div className="text-sm text-red-500">{error}</div>
                        </div>
                    )}

                    <div className="glass neon-border rounded-3xl p-8 mb-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Profile Information</div>
                                <h2 className="text-3xl font-display font-bold mt-2 text-gradient-neon">{userData?.name}</h2>
                            </div>
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 transition"
                            >
                                {editMode ? "Cancel" : "Edit"}
                            </button>
                        </div>

                        {!editMode ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</div>
                                    <div className="text-lg font-medium mt-1">{userData?.email}</div>
                                </div>
                                {userData?.phone && (
                                    <div>
                                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phone</div>
                                        <div className="text-lg font-medium mt-1">{userData.phone}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form className="space-y-4" onSubmit={handleSave}>
                                <div>
                                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full mt-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        disabled
                                        className="w-full mt-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phone</label>
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        placeholder="e.g. +12345678901"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="w-full mt-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50"
                                    />
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        Enter exactly 10 digits.
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full mt-6 py-2 rounded-lg bg-gradient-to-r from-neon-pink to-neon-blue font-semibold text-primary-foreground glow-pink hover:scale-105 transition"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Link
                            to="/orders"
                            className="glass neon-border rounded-3xl p-6 hover:border-neon-blue/50 hover:bg-white/5 transition cursor-pointer"
                        >
                            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Quick Link</div>
                            <h3 className="text-xl font-semibold mt-2">My Orders</h3>
                            <p className="text-sm text-muted-foreground mt-2">View your order history and track shipments</p>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="glass neon-border rounded-3xl p-6 hover:border-red-500/50 hover:bg-red-500/5 transition text-left"
                        >
                            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account</div>
                            <h3 className="text-xl font-semibold mt-2">Logout</h3>
                            <p className="text-sm text-muted-foreground mt-2">Sign out of your account</p>
                        </button>
                    </div>
                </div>
            </section>
        </PageShell>
    );
}
