import type { Category, Customer, Order, Product } from "../types";

export const statCards = [
    { label: "Total Sales", value: "Rs. 42.8L", trend: "+12.4%" },
    { label: "Total Orders", value: "4,280", trend: "+7.9%" },
    { label: "Total Products", value: "612", trend: "+2.1%" },
    { label: "Revenue", value: "Rs. 18.2L", trend: "+5.3%" },
    { label: "Pending Orders", value: "84", trend: "-4.2%" },
    { label: "Active Customers", value: "1,180", trend: "+9.1%" },
    { label: "Imported Products", value: "142", trend: "+3.4%" },
    { label: "Low Stock", value: "12", trend: "-2.0%" },
];

export const products: Product[] = [
    {
        id: "p-001",
        name: "Kakashi Shadow Ops 1/6",
        category: "Naruto",
        price: 8999,
        discountPrice: 7999,
        stock: 24,
        rating: 4.8,
        badge: "-12%",
        imageUrl: "https://placehold.co/600x600/png",
        description: "Stealth matte finish with precision sculpted armor plates.",
        offerText: "Limited: Free display stand",
        type: "standard",
        featured: true,
        imported: false,
        status: "active",
    },
    {
        id: "p-002",
        name: "Luffy Gear Fifth Aura",
        category: "One Piece",
        price: 12999,
        discountPrice: 11499,
        stock: 8,
        rating: 4.9,
        badge: "New",
        imageUrl: "https://placehold.co/600x600/png",
        description: "Collector grade aura sculpt with neon base effects.",
        offerText: "Festival offer 12% off",
        type: "imported",
        featured: true,
        imported: true,
        status: "active",
    },
    {
        id: "p-003",
        name: "Kaneki Black Requiem",
        category: "Tokyo Ghoul",
        price: 10499,
        stock: 5,
        rating: 4.7,
        badge: "Limited",
        imageUrl: "https://placehold.co/600x600/png",
        description: "Dark resin build with premium wing cape textures.",
        offerText: "Low stock alert",
        type: "imported",
        featured: false,
        imported: true,
        status: "active",
    },
];

export const orders: Order[] = [
    { id: "ORD-9021", customer: "Riya Sharma", total: 8999, status: "processing", paymentStatus: "paid", createdAt: "2026-05-15" },
    { id: "ORD-9022", customer: "Arjun Mehta", total: 12999, status: "pending", paymentStatus: "pending", createdAt: "2026-05-14" },
    { id: "ORD-9023", customer: "Saif Ali", total: 4499, status: "packed", paymentStatus: "paid", createdAt: "2026-05-14" },
    { id: "ORD-9024", customer: "Priya Raj", total: 15999, status: "shipped", paymentStatus: "failed", createdAt: "2026-05-13" },
];

export const categories: Category[] = [
    { id: "c-1", name: "Naruto", slug: "naruto", description: "Leaf village legends", featured: true },
    { id: "c-2", name: "One Piece", slug: "one-piece", description: "Pirate era icons", featured: true },
    { id: "c-3", name: "Tokyo Ghoul", slug: "tokyo-ghoul", description: "Dark fusion", featured: false },
    { id: "c-4", name: "Demon Slayer", slug: "demon-slayer", description: "Blade masters", featured: true },
    { id: "c-5", name: "Dragon Ball", slug: "dragon-ball", description: "Saiyan power", featured: false },
    { id: "c-6", name: "Attack on Titan", slug: "attack-on-titan", description: "Titan warfare", featured: false },
];

export const customers: Customer[] = [
    { id: "u-1", name: "Aditi Menon", email: "aditi@example.com", totalSpent: 28899, orders: 6, status: "vip" },
    { id: "u-2", name: "Kabir Singh", email: "kabir@example.com", totalSpent: 10999, orders: 2, status: "active" },
    { id: "u-3", name: "Neha Kapoor", email: "neha@example.com", totalSpent: 0, orders: 0, status: "inactive" },
];

