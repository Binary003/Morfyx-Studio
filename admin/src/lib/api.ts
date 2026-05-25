// Admin API Client
function normalizeApiBaseUrl(rawBaseUrl: string | undefined): string {
    const fallbackBaseUrl = "http://localhost:5000/api";
    const baseUrl = rawBaseUrl?.trim() || fallbackBaseUrl;

    try {
        const parsedUrl = new URL(baseUrl);
        if (parsedUrl.pathname === "/" || parsedUrl.pathname === "") {
            parsedUrl.pathname = "/api";
        }
        return parsedUrl.toString().replace(/\/+$/, "");
    } catch {
        if (baseUrl.startsWith("/")) {
            const normalizedPath = baseUrl.replace(/\/+$/, "");
            return normalizedPath.endsWith("/api") ? normalizedPath : `${normalizedPath}/api`;
        }

        return baseUrl.replace(/\/+$/, "");
    }
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

interface RequestOptions extends RequestInit {
    withCredentials?: boolean;
}

class AdminApiClient {
    private baseUrl: string;
    private authTokenKey = "morfyx_admin_access_token";

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getAuthToken() {
        try {
            return localStorage.getItem(this.authTokenKey) || "";
        } catch {
            return "";
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const fetchOptions: RequestInit = {
            ...options,
            credentials: "include",
        };

        // Set up headers
        const headers: HeadersInit = {};
        const authToken = this.getAuthToken();

        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }

        // Only set Content-Type for non-FormData requests
        if (!(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        fetchOptions.headers = {
            ...headers,
            ...options.headers,
        };

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            // Handle 401 - token expired or invalid
            if (response.status === 401) {
                window.location.href = "/login";
            }

            const error = await response.json().catch(() => ({
                message: `HTTP ${response.status}`,
            }));
            throw new Error(error.message || "API request failed");
        }

        return response.json();
    }

    // Auth
    async adminLogin(credentials: { email: string; password: string }) {
        const response = await this.request<any>("/auth/admin/login", {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response;
    }

    setAuthToken(token: string) {
        try {
            if (token) {
                localStorage.setItem(this.authTokenKey, token);
            } else {
                localStorage.removeItem(this.authTokenKey);
            }
        } catch {
            // ignore storage failures
        }
    }

    async logout() {
        this.setAuthToken("");
        return this.request("/auth/logout", {
            method: "POST",
        });
    }

    async refreshToken() {
        return this.request("/auth/refresh", {
            method: "POST",
        });
    }

    // Products (Admin CRUD)
    async getProducts(params?: {
        page?: number;
        limit?: number;
        category?: string;
    }) {
        const query = new URLSearchParams();
        if (params?.page) query.append("page", params.page.toString());
        if (params?.limit) query.append("limit", params.limit.toString());
        if (params?.category) query.append("category", params.category);

        const response = await this.request<any>(`/products?${query}`);

        // Transform backend response to match admin's Product type
        if (response.data?.items && Array.isArray(response.data.items)) {
            response.data.items = response.data.items.map((p: any) => ({
                id: p._id || p.id,
                name: p.name,
                category: p.animeCategory?.name || p.animeCategory?.slug || p.category?.name || p.category || "General",
                price: p.price,
                discountPrice: p.discountPrice,
                stock: p.stock || 0,
                rating: p.rating || 0,
                badge: p.badge,
                imageUrl: p.images?.[0]?.url || p.images?.[0],
                description: p.description,
                offerText: p.offerStrip,
                type: p.origin === "imported" || p.productType === "imported" ? "imported" : "standard",
                featured: p.featured || false,
                imported: p.origin === "imported" || p.productType === "imported",
                status: p.status || "active"
            }));
        }

        return response;
    }

    async getProduct(id: string) {
        const response = await this.request<any>(`/products/${id}`);

        // Transform single product for edit form
        if (response.data?.product) {
            const p = response.data.product;
            response.data.product = {
                id: p._id || p.id,
                name: p.name,
                category: p.animeCategory?.name || p.animeCategory?.slug || p.category?.name || p.category || "General",
                categoryId: p.animeCategory?._id || p.animeCategory || "",  // Category ID for form
                price: p.price,
                discountPrice: p.discountPrice,
                stock: p.stock || 0,
                rating: p.rating || 0,
                badge: p.badge,
                imageUrl: p.images?.[0]?.url || p.images?.[0],
                images: p.images?.map((img: any) => ({ url: img.url || img })) || [],  // All images
                description: p.description,
                offerText: p.offerStrip,
                type: p.origin === "imported" || p.productType === "imported" ? "imported" : "standard",
                featured: p.featured || false,
                imported: p.origin === "imported" || p.productType === "imported",
                status: p.status || "active"
            };
        }

        return response;
    }

    async createProduct(formData: FormData) {
        return this.request("/products", {
            method: "POST",
            body: formData,
        });
    }

    async updateProduct(id: string, formData: FormData) {
        return this.request(`/products/${id}`, {
            method: "PUT",
            body: formData,
        });
    }

    async deleteProduct(id: string) {
        return this.request(`/products/${id}`, {
            method: "DELETE",
        });
    }

    // Categories (Admin CRUD)
    async getCategories() {
        return this.request<any>("/categories");
    }

    async createCategory(data: { name: string; slug?: string; description?: string; featured?: boolean } | FormData) {
        return this.request("/categories", {
            method: "POST",
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
    }

    async updateCategory(id: string, data: { name: string; slug?: string; description?: string; featured?: boolean } | FormData) {
        return this.request(`/categories/${id}`, {
            method: "PUT",
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
    }

    async deleteCategory(id: string) {
        return this.request(`/categories/${id}`, {
            method: "DELETE",
        });
    }

    // Offers / Offer strip
    async getOffers() {
        return this.request<any>("/offers");
    }

    async updateOffers(data: { items: string[] }) {
        return this.request("/offers", {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async getOrders(params?: {
        page?: number;
        limit?: number;
        status?: string;
    }) {
        const query = new URLSearchParams();
        if (params?.page) query.append("page", params.page.toString());
        if (params?.limit) query.append("limit", params.limit.toString());
        if (params?.status) query.append("status", params.status);

        return this.request<any>(`/orders?${query}`);
    }

    async getOrder(id: string) {
        return this.request<any>(`/orders/${id}`);
    }

    async updateOrder(id: string, data: { status?: string; trackingId?: string; shipmentStatus?: string; deliveryDays?: number }) {
        return this.request(`/orders/${id}/status`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    // Inventory
    async getInventory(params?: { page?: number; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.page) query.append("page", params.page.toString());
        if (params?.limit) query.append("limit", params.limit.toString());

        return this.request<any>(`/inventory?${query}`);
    }

    async updateStock(productId: string, quantity: number) {
        return this.request(`/inventory/${productId}`, {
            method: "PUT",
            body: JSON.stringify({ quantity }),
        });
    }

    // Analytics
    async getAnalytics() {
        return this.request<any>("/analytics");
    }

    async getSalesTrend(period: "week" | "month" | "year" = "month") {
        return this.request<any>(`/analytics/sales?period=${period}`);
    }

    // Reviews
    async getReviews(params?: { page?: number; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.page) query.append("page", params.page.toString());
        if (params?.limit) query.append("limit", params.limit.toString());

        return this.request<any>(`/reviews?${query}`);
    }

    // Customers
    async getCustomers(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const query = new URLSearchParams();
        if (params?.page) query.append("page", params.page.toString());
        if (params?.limit) query.append("limit", params.limit.toString());
        if (params?.search) query.append("search", params.search);

        return this.request<any>(`/customers?${query}`);
    }

    // Auth verification
    async verifyAuth() {
        try {
            const response = await this.request<any>("/auth/me", {
                method: "GET",
            });
            return response?.data?.user || null;
        } catch (err) {
            return null;
        }
    }
}

export const adminApi = new AdminApiClient(API_BASE_URL);
export const api = adminApi;
