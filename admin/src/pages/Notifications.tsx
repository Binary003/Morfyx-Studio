import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../lib/api";

type NotificationItem = {
    _id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
    data?: Record<string, unknown>;
};

export function NotificationsPage() {
    const [notes, setNotes] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                setLoading(true);
                const response: any = await api.getNotifications();
                const items = response?.data?.items || response?.items || [];
                setNotes(Array.isArray(items) ? items : []);
            } catch (err: any) {
                setError(err.message || "Failed to load notifications");
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Notifications"
                subtitle="Realtime alerts and admin messages."
            />

            {error && (
                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
                    {error}
                </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                {loading ? (
                    <Card>
                        <CardContent className="py-5 text-sm text-mutedForeground">Loading notifications...</CardContent>
                    </Card>
                ) : notes.length === 0 ? (
                    <Card>
                        <CardContent className="py-5 text-sm text-mutedForeground">No notifications yet.</CardContent>
                    </Card>
                ) : (
                    notes.map((note) => (
                        <Card key={note._id}>
                            <CardContent className="py-5">
                                <div className="text-sm font-semibold">{note.title}</div>
                                <div className="text-xs text-mutedForeground">{note.message}</div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </motion.div>
    );
}
