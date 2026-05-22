export type OrderStatus = "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    discountPrice?: number;
    stock: number;
    rating: number;
    badge?: string;
    imageUrl?: string;
    description?: string;
    offerText?: string;
    type: "standard" | "imported";
    featured: boolean;
    imported: boolean;
    status: "active" | "draft" | "archived";
}

export interface Order {
    id: string;
    customer: string;
    total: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    featured: boolean;
    bannerImage?: {
        url: string;
        publicId: string;
    };
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    orders: number;
    status: "active" | "vip" | "inactive";
}

