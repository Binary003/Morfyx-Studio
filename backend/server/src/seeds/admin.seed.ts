import { connect } from "mongoose";
import { User } from "../models/User";
import { env } from "../config/env";

async function seedAdminUser() {
    try {
        await connect(env.mongodbUri);
        console.log("Connected to MongoDB");

        // Check if the admin email already exists, even if it was created with a different role.
        const existingAdmin = await User.findOne({ email: "admin@morfyx.com" });
        if (existingAdmin) {
            existingAdmin.role = "admin";
            existingAdmin.password = "Shivam@morfyx65";
            await existingAdmin.save();
            console.log("✅ Admin user already exists");
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Password updated to: Shivam@morfyx65`);
            process.exit(0);
        }

        // Create new admin user
        // Password will be hashed automatically by User model pre-save middleware
        const admin = await User.create({
            email: "admin@morfyx.com",
            password: "Shivam@morfyx65",
            name: "Morfyx Admin",
            role: "admin",
        });

        console.log("✅ Admin user created successfully!");
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: Shivam@morfyx65`);
        console.log(`   Role: ${admin.role}`);
        console.log("\n⚠️  IMPORTANT: Change this password immediately in production!");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding admin user:", error);
        process.exit(1);
    }
}

seedAdminUser();
