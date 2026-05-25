// Frontend API Client
import { ACCESS_TOKEN_KEY } from "./auth";

function normalizeApiBaseUrl(rawBaseUrl: string | undefined): string {
    const fallbackBaseUrl = "http://localhost:5000/api";
    const baseUrl = rawBaseUrl?.trim() || fallbackBaseUrl;

    try {
        const parsedUrl = new URL(baseUrl);
        if (parsedUrl.pathname === "/" || parsedUrl.pathname === "") {
            parsedUrl.pathname = "/api";
        }
        return parsedUrl.toString().replace(/\/$/, "");
    } catch {
        if (baseUrl.startsWith("/")) {
            return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl.replace(/\/$/, "")}/api`;
        }
        return baseUrl.replace(/\/$/, "");
    }
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

interface RequestOptions extends RequestInit {
    withCredentials?: boolean;
    skipAuthRefresh?: boolean;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getAccessToken() {
        try {
            return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
        } catch {
            return "";
        }
    }

    public setAccessToken(token: string) {
        try {
            if (token) {
                localStorage.setItem(ACCESS_TOKEN_KEY, token);
            } else {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
            }
        } catch {
            // ignore storage failures
        }
    }

    public clearAccessToken() {
        this.setAccessToken("");
    }

    private shouldAttemptAuthRefresh(endpoint: string, options: RequestOptions) {
        if (options.skipAuthRefresh) return false;

        return !endpoint.startsWith("/auth/login")
            && !endpoint.startsWith("/auth/register")
            && !endpoint.startsWith("/auth/admin/login")
            && !endpoint.startsWith("/auth/refresh")
            && !endpoint.startsWith("/auth/forgot-password")
            && !endpoint.startsWith("/auth/reset-password");
    }

    private async refreshAccessToken() {
        try {
            const response: any = await this.request("/auth/refresh", {
                method: "POST",
                skipAuthRefresh: true,
            });

            const accessToken = response?.data?.accessToken;
            if (accessToken) {
                this.setAccessToken(accessToken);
                return true;
            }
        } catch {
            // fall through to the original error
        }

        return false;
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const authToken = this.getAccessToken();

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (authToken && !("Authorization" in headers)) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }

        const response = await fetch(url, {
            ...options,
            cache: "no-store",
            credentials: "include",
            headers,
        });

        const data = await response.json().catch(() => ({
            message: `HTTP ${response.status}`,
        }));

        if (!response.ok) {
            if (response.status === 401 && this.shouldAttemptAuthRefresh(endpoint, options)) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    return this.request<T>(endpoint, {
                        ...options,
                        skipAuthRefresh: true,
                    });
                }
            }

            const error = new Error(data.message || `HTTP ${response.status}`) as any;
            error.response = { status: response.status, data };
            throw error;
        }

        return data;
    }

    // Products
    async getProducts(params?: {
        page?: number;
        limit?: number;
        category?: string;
        sort?: string;
    }) {
        const query = new URLSearchParams();
        if (params?.page) query.append("page", params.page.toString());
        if (params?.limit) query.append("limit", params.limit.toString());
        if (params?.category) query.append("category", params.category);
        if (params?.sort) query.append("sort", params.sort);

        return this.request<any>(`/products?${query}`);
    }

    async searchProducts(q: string, limit: number = 10) {
        return this.request<any>(`/products/search?q=${q}&limit=${limit}`);
    }

    async getProduct(id: string) {
        return this.request<any>(`/products/${id}`);
    }

    // Categories
    async getCategories() {
        return this.request<any>("/categories");
    }

    async getOffers() {
        return this.request<any>("/offers");
    }

    // Orders
    async createOrder(orderData: any) {
        return this.request("/orders", {
            method: "POST",
            body: JSON.stringify(orderData),
        });
    }

    async getOrders(params?: { page?: number; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.page) query.append("page", params.page.toString());
        if (params?.limit) query.append("limit", params.limit.toString());

        return this.request<any>(`/orders/me?${query}`);
    }

    async getOrder(id: string) {
        return this.request<any>(`/orders/${id}`);
    }

    // Wishlist
    async getWishlist() {
        return this.request<any>("/wishlist");
    }

    async addToWishlist(productId: string) {
        return this.request("/wishlist", {
            method: "POST",
            body: JSON.stringify({ productId }),
        });
    }

    async removeFromWishlist(productId: string) {
        return this.request(`/wishlist/${productId}`, {
            method: "DELETE",
        });
    }

    // Reviews
    async getReviews(productId: string, page: number = 1, limit: number = 10) {
        return this.request<any>(
            `/reviews?productId=${productId}&page=${page}&limit=${limit}`
        );
    }

    async createReview(reviewData: {
        productId: string;
        rating: number;
        comment: string;
    }) {
        return this.request("/reviews", {
            method: "POST",
            body: JSON.stringify(reviewData),
        });
    }

    // Auth
    async register(userData: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }) {
        return this.request("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    }

    async login(credentials: { email: string; password: string }) {
        return this.request("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
    }

    async logout() {
        this.clearAccessToken();
        return this.request("/auth/logout", {
            method: "POST",
        });
    }

    async refreshToken() {
        return this.request("/auth/refresh", {
            method: "POST",
        });
    }

    async getMe() {
        return this.request("/auth/me");
    }

    async updateMe(data: { name?: string; phone?: string }) {
        return this.request("/auth/me", {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    // Payments
    async createRazorpayOrder(data: { orderId: string; amount: number; paymentType?: 'advance' | 'full' }) {
        return this.request("/payments/razorpay/order", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async verifyPayment(data: {
        razorpayPaymentId: string;
        razorpayOrderId: string;
        razorpaySignature: string;
        orderId: string;
    }) {
        return this.request("/payments/razorpay/verify", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // Generic HTTP methods
    async post<T = any>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async get<T = any>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: "GET",
        });
    }

    async put<T = any>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T = any>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: "DELETE",
        });
    }
}

export const api = new ApiClient(API_BASE_URL);
