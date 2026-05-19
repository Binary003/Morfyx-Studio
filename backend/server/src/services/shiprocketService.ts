import axios, { AxiosInstance } from "axios";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

interface ShiprocketAuthToken {
    token: string;
    expiresAt: number;
}

/**
 * Shiprocket Service
 * Handles authentication, shipment creation, cancellation, and tracking
 * Implements token caching to reduce API calls
 */
class ShiprocketService {
    private baseURL = "https://apiv2.shiprocket.in/v1/external";
    private authToken: ShiprocketAuthToken | null = null;
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
        });

        // Add request interceptor to attach auth token
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                const token = await this.getAuthToken();
                config.headers.Authorization = `Bearer ${token}`;
                config.headers["Content-Type"] = "application/json";
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor for error handling
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired, clear cache and retry
                    this.authToken = null;
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Get or refresh authentication token
     * Token is cached in memory and reused within validity period
     */
    private async getAuthToken(): Promise<string> {
        // Return cached token if still valid
        if (this.authToken && this.authToken.expiresAt > Date.now()) {
            console.log("✅ Using cached Shiprocket token");
            return this.authToken.token;
        }

        try {
            console.log("🔵 Fetching new Shiprocket authentication token...");

            const response = await axios.post(
                `${this.baseURL}/auth/login`,
                {
                    email: env.shiprocketEmail,
                    password: env.shiprocketPassword,
                },
                {
                    headers: { "Content-Type": "application/json" },
                    timeout: 10000,
                }
            );

            const token = response.data.token;
            const expiresInSeconds = response.data.expires_in || 3600; // Default 1 hour

            this.authToken = {
                token,
                expiresAt: Date.now() + expiresInSeconds * 1000 - 60000, // Refresh 1 min before expiry
            };

            console.log("✅ Shiprocket authentication successful");
            return token;
        } catch (error: any) {
            console.error("❌ Shiprocket authentication failed:", error.message);
            throw new ApiError(500, `Shiprocket authentication failed: ${error.message}`);
        }
    }

    /**
     * Create a shipment in Shiprocket
     * Supports COD (Cash on Delivery) payment method
     */
    async createShipment(payload: {
        orderId: string;
        totalAmount: number;
        codAmount: number;
        subTotal: number;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        items: Array<{ name: string; quantity: number; price: number }>;
    }) {
        const maxRetries = 3;
        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔵 Creating Shiprocket shipment (attempt ${attempt}/${maxRetries})...`);

                const shiprocketPayload = {
                    order_id: payload.orderId,
                    order_date: new Date().toISOString(),
                    channel_id: process.env.SHIPROCKET_CHANNEL_ID || 17107,
                    pickup_location_id: process.env.SHIPROCKET_PICKUP_ID || 270249,
                    comment: "Advance payment 30% | COD 70%",
                    billing_customer_name: payload.customerName,
                    billing_email: payload.customerEmail,
                    billing_phone: payload.customerPhone,
                    billing_address: payload.address,
                    billing_city: payload.city,
                    billing_state: payload.state,
                    billing_country: payload.country,
                    billing_pincode: payload.postalCode,
                    shipping_customer_name: payload.customerName,
                    shipping_email: payload.customerEmail,
                    shipping_phone: payload.customerPhone,
                    shipping_address: payload.address,
                    shipping_city: payload.city,
                    shipping_state: payload.state,
                    shipping_country: payload.country,
                    shipping_pincode: payload.postalCode,
                    order_items: payload.items.map((item) => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    payment_method: "COD", // Cash on Delivery
                    sub_total: payload.subTotal,
                    length: 10,
                    breadth: 10,
                    height: 10,
                    weight: 1,
                    cod_amount: payload.codAmount, // ONLY remaining 70%
                    total_discount: 0,
                    is_insured: false,
                };

                const response = await this.axiosInstance.post("/orders/create/adhoc", shiprocketPayload);

                if (response.data.success) {
                    console.log("✅ Shiprocket shipment created successfully:", response.data.data.shipment_id);
                    return {
                        shipmentId: response.data.data.shipment_id,
                        orderId: response.data.data.order_id,
                        courierPartnerName: response.data.data.courier_name || "TBD",
                        trackingId: response.data.data.tracking_number || null,
                        labelUrl: response.data.data.label_url || null,
                    };
                } else {
                    throw new Error(response.data.message || "Failed to create shipment");
                }
            } catch (error: any) {
                lastError = error;
                const errorMsg = error.response?.data?.message || error.message;
                console.error(`❌ Shipment creation failed (attempt ${attempt}):`, errorMsg);

                if (attempt < maxRetries) {
                    // Exponential backoff: 1s, 2s, 4s
                    const delayMs = Math.pow(2, attempt - 1) * 1000;
                    console.log(`⏳ Retrying in ${delayMs}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                }
            }
        }

        throw new ApiError(500, `Failed to create Shiprocket shipment after ${maxRetries} retries: ${lastError.message}`);
    }

    /**
     * Cancel a shipment in Shiprocket
     * Only possible if shipment hasn't been picked up by courier
     */
    async cancelShipment(shipmentId: string): Promise<{ success: boolean; message: string }> {
        try {
            console.log(`🔵 Cancelling Shiprocket shipment: ${shipmentId}`);

            const response = await this.axiosInstance.post(
                `/orders/cancel/${shipmentId}`,
                {},
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (response.data.success) {
                console.log("✅ Shiprocket shipment cancelled successfully");
                return {
                    success: true,
                    message: response.data.message || "Shipment cancelled successfully",
                };
            } else {
                // Check if shipment is already in transit or shipped
                if (response.data.message.toLowerCase().includes("picked")) {
                    throw new ApiError(
                        400,
                        "Shipment has already been picked up by courier. Cancellation not allowed."
                    );
                }
                throw new Error(response.data.message || "Failed to cancel shipment");
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error("❌ Shipment cancellation failed:", errorMsg);

            // Check for specific error patterns
            if (errorMsg.toLowerCase().includes("picked") || errorMsg.toLowerCase().includes("shipped")) {
                throw new ApiError(
                    400,
                    "Order cancellation is no longer available because the shipment has already been processed/shipped."
                );
            }

            throw new ApiError(500, `Failed to cancel shipment: ${errorMsg}`);
        }
    }

    /**
     * Track a shipment
     */
    async trackShipment(
        shipmentId: string
    ): Promise<{
        status: string;
        trackingNumber: string;
        courierPartner: string;
        lastUpdate: string;
    }> {
        try {
            console.log(`🔵 Tracking Shiprocket shipment: ${shipmentId}`);

            const response = await this.axiosInstance.get(`/courier/track/shipment/${shipmentId}`);

            if (response.data.success) {
                const tracking = response.data.data[0] || {};
                console.log("✅ Shipment tracking retrieved");
                return {
                    status: tracking.status || "pending",
                    trackingNumber: tracking.tracking_number || shipmentId,
                    courierPartner: tracking.courier_name || "N/A",
                    lastUpdate: tracking.last_update || new Date().toISOString(),
                };
            } else {
                throw new Error(response.data.message || "Failed to track shipment");
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error("❌ Shipment tracking failed:", errorMsg);
            throw new ApiError(500, `Failed to track shipment: ${errorMsg}`);
        }
    }

    /**
     * Get shipment details
     */
    async getShipmentDetails(shipmentId: string): Promise<any> {
        try {
            console.log(`🔵 Fetching Shiprocket shipment details: ${shipmentId}`);

            const response = await this.axiosInstance.get(`/orders/show/${shipmentId}`);

            if (response.data.success) {
                console.log("✅ Shipment details retrieved");
                return response.data.data;
            } else {
                throw new Error(response.data.message || "Failed to fetch shipment details");
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error("❌ Failed to fetch shipment details:", errorMsg);
            throw new ApiError(500, `Failed to fetch shipment details: ${errorMsg}`);
        }
    }

    /**
     * Clear cached auth token (useful for logout/reset)
     */
    clearAuthToken(): void {
        this.authToken = null;
        console.log("🔵 Shiprocket auth token cleared");
    }
}

// Export singleton instance
export const shiprocketService = new ShiprocketService();
