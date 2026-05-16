import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export function OffersPage() {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Offers & Banners"
                subtitle="Schedule banners, festival promos, and offer strips."
                action={<Button>Create Offer</Button>}
            />

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {[
                    "Festival Flash Sale",
                    "Limited Edition Drop",
                    "Homepage Hero Banner",
                ].map((title) => (
                    <Card key={title}>
                        <CardHeader>
                            <CardTitle>{title}</CardTitle>
                            <p className="text-xs text-mutedForeground">Active until 28 May</p>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-border/60 bg-card/60 p-3 text-xs text-mutedForeground">
                                Preview banner here
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Offer Strip Text</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        <Input placeholder="Limited time: 15% off all imported figures" />
                        <Input placeholder="Free shipping on orders over Rs. 2999" />
                        <Input placeholder="Bundle deal: Buy 2 get 10% extra off" />
                        <Input placeholder="New arrivals this week - shop now" />
                    </div>
                    <div className="mt-4">
                        <Button>Save Offers</Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
