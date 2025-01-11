export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface ProductInventory {
  quantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductReview {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductMerchant {
  _id: string;
  firstName: string;
  lastName: string;
  merchantInfo: {
    businessName: string;
    isVerified: boolean;
  };
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  sku?: string;
  images: ProductImage[];
  specifications?: ProductSpecification[];
  inventory: ProductInventory;
  merchant: ProductMerchant;
  rating: ProductRating;
  reviews?: ProductReview[];
  tags?: string[];
  featured: boolean;
  isActive: boolean;
  weight?: {
    value: number;
    unit: string;
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  createdAt: string;
  updatedAt: string;

  // Virtual properties
  inStock?: boolean;
  isLowStock?: boolean;
  primaryImage?: ProductImage;
}
