import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export function ProfilePage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <SectionHeader
        title="Admin Profile"
        subtitle="Manage profile details, password, and activity."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Name" defaultValue="Admin Akira" />
            <Input placeholder="Email" defaultValue="admin@morfyx.com" />
            <Button>Update Profile</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Current password" type="password" />
            <Input placeholder="New password" type="password" />
            <Button>Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
