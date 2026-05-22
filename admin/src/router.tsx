import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { RequireAuth } from "./components/auth/RequireAuth";
import { DashboardPage } from "./pages/Dashboard";
import { ProductsPage } from "./pages/Products";
import { CategoriesPage } from "./pages/Categories";
import { OrdersPage } from "./pages/Orders";
import { CustomersPage } from "./pages/Customers";
import { InventoryPage } from "./pages/Inventory";
import { OffersPage } from "./pages/Offers";
import { AnalyticsPage } from "./pages/Analytics";
import { ReviewsPage } from "./pages/Reviews";
import { NotificationsPage } from "./pages/Notifications";
import { SettingsPage } from "./pages/Settings";
import { ProfilePage } from "./pages/Profile";
import { LoginPage } from "./pages/Login";
import { ProductFormPage } from "./pages/ProductForm";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/",
        element: (
            <RequireAuth>
                <AdminLayout />
            </RequireAuth>
        ),
        children: [
            { index: true, element: <DashboardPage /> },
            { path: "products", element: <ProductsPage /> },
            { path: "products/new", element: <ProductFormPage /> },
            { path: "products/:id", element: <ProductFormPage /> },
            { path: "categories", element: <CategoriesPage /> },
            { path: "orders", element: <OrdersPage /> },
            { path: "customers", element: <CustomersPage /> },
            { path: "collections", element: <InventoryPage /> },
            { path: "inventory", element: <InventoryPage /> },
            { path: "offers", element: <OffersPage /> },
            { path: "analytics", element: <AnalyticsPage /> },
            { path: "reviews", element: <ReviewsPage /> },
            { path: "notifications", element: <NotificationsPage /> },
            { path: "settings", element: <SettingsPage /> },
            { path: "profile", element: <ProfilePage /> },
        ],
    },
]);
