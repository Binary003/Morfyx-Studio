import { CheckCircle2, Info } from "lucide-react";

type NotificationNote = {
    id?: string;
    title: string;
    description: string;
};

const fallbackNotifications: NotificationNote[] = [
    { title: "New wholesale lead", description: "Neo Otaku Stores just submitted a request." },
    { title: "Stock alert", description: "Kaneki Black Requiem is below threshold." },
];

interface ToastRailProps {
    notes?: NotificationNote[];
}

export function ToastRail({ notes = fallbackNotifications }: ToastRailProps) {
    return (
        <div className="space-y-3">
            {notes.map((note, index) => (
                <div key={note.id || `${note.title}-${index}`} className="glass rounded-2xl border border-border/60 p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-neonCyan/20 grid place-items-center">
                            {note.title.includes("Stock") ? (
                                <Info className="h-4 w-4 text-neonCyan" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 text-neonPink" />
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-semibold">{note.title}</div>
                            <div className="text-xs text-mutedForeground">{note.description}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
