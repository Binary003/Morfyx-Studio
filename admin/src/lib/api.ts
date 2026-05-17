// Admin API Client
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  withCredentials?: boolean;
}

class AdminApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}`,
      }));
      throw new Error(error.message || "API request failed");
    }

    return response.json();
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

    return this.request<any>(`/products?${query}`);
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async createProduct(formData: FormData) {
    return this.request("/products", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for multipart
    });
  }

  async updateProduct(id: string, formData: FormData) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: formData,
      headers: {},
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

  async createCategory(data: { name: string }) {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: { name: string }) {
    return this.request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // Orders (Admin View)
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

  // Auth
  async adminLogin(credentials: { email: string; password: string }) {
    return this.request("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async refreshToken() {
    return this.request("/auth/refresh", {
      method: "POST",
    });
  }
}

export const adminApi = new AdminApiClient(API_BASE_URL);
