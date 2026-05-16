import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent } from "../components/ui/card";

const notes = [
    { title: "Order packed", description: "ORD-9023 is packed and ready for shipping." },
    { title: "New wholesale enquiry", description: "Collector Hub requested 18 units." },
    { title: "Low stock", description: "Kaneki Black Requiem stock below 5." },
];

export function NotificationsPage() {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Notifications"
                subtitle="Realtime alerts and admin messages."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                {notes.map((note) => (
                    <Card key={note.title}>
                        <CardContent className="py-5">
                            <div className="text-sm font-semibold">{note.title}</div>
                            <div className="text-xs text-mutedForeground">{note.description}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </motion.div>
    );
}
