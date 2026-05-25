import { createContext, useContext, ReactNode, useState } from "react";

interface ProductDetailContextType {
  isProductDetailOpen: boolean;
  setIsProductDetailOpen: (isOpen: boolean) => void;
}

const ProductDetailContext = createContext<ProductDetailContextType | undefined>(undefined);

export function ProductDetailProvider({ children }: { children: ReactNode }) {
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

  return (
    <ProductDetailContext.Provider value={{ isProductDetailOpen, setIsProductDetailOpen }}>
      {children}
    </ProductDetailContext.Provider>
  );
}

export function useProductDetail() {
  const context = useContext(ProductDetailContext);
  if (!context) {
    throw new Error("useProductDetail must be used within ProductDetailProvider");
  }
  return context;
}
