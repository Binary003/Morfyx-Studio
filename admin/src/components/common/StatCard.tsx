import { MiniSpark } from "../charts/MiniSpark";
import { Card, CardContent, CardHeader } from "../ui/card";

interface StatCardProps {
    label: string;
    value: string;
    trend: string;
    spark?: number[];
}

export function StatCard({ label, value, trend, spark = [2, 5, 3, 6, 4, 7] }: StatCardProps) {
    return (
        <Card className="relative overflow-hidden">
            <CardHeader>
                <div className="text-xs uppercase tracking-[0.3em] text-mutedForeground">{label}</div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-2xl font-semibold">{value}</div>
                        <div className="text-xs text-neonCyan">{trend}</div>
                    </div>
                    <MiniSpark data={spark} />
                </div>
            </CardContent>
        </Card>
    );
}
