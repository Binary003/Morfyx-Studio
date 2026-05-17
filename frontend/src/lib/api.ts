// Frontend API Client
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  withCredentials?: boolean;
}

class ApiClient {
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

    return this.request<any>(`/orders?${query}`);
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
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async refreshToken() {
    return this.request("/auth/refresh", {
      method: "POST",
    });
  }

  // Payments
  async createRazorpayOrder(data: { orderId: string; amount: number }) {
    return this.request("/payments/razorpay/order", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(data: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  }) {
    return this.request("/payments/razorpay/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
