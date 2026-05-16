import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export function SettingsPage() {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Settings"
                subtitle="Manage store, payment, shipping, and admin permissions."
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Store Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input placeholder="Store name" defaultValue="Morfyx Studio" />
                        <Input placeholder="Support email" defaultValue="support@morfyx.com" />
                        <Button>Save</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input placeholder="Default shipping days" defaultValue="5" />
                        <Input placeholder="Courier partner" defaultValue="Speedy Logistics" />
                        <Button>Update</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input placeholder="Gateway" defaultValue="Razorpay" />
                        <Input placeholder="Webhook URL" defaultValue="https://api.morfyx.com/payments" />
                        <Button>Update</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input placeholder="2FA" defaultValue="Enabled" />
                        <Input placeholder="Session timeout" defaultValue="30 min" />
                        <Button>Update</Button>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}
