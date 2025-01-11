import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../shared/models/product.model';
import { environment } from '../../../environments/environment';

export interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
  inStock?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getProducts(filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ProductsResponse>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getFeaturedProducts(): Observable<ProductsResponse> {
    return this.getProducts({ featured: true });
  }

  getProductsByCategory(category: string, filters: ProductFilters = {}): Observable<ProductsResponse> {
    return this.getProducts({ ...filters, category });
  }

  searchProducts(query: string, filters: ProductFilters = {}): Observable<ProductsResponse> {
    return this.getProducts({ ...filters, search: query });
  }

  createProduct(product: Partial<Product>): Observable<{ message: string; product: Product }> {
    return this.http.post<{ message: string; product: Product }>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<{ message: string; product: Product }> {
    return this.http.put<{ message: string; product: Product }>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Image upload methods
  uploadProductImages(productId: string, images: File[]): Observable<any> {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });

    return this.http.post(`${environment.apiUrl}/upload/product/${productId}/images`, formData);
  }

  setPrimaryImage(productId: string, imageIndex: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/upload/product/${productId}/images/${imageIndex}/primary`, {});
  }

  deleteProductImage(productId: string, imageIndex: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/upload/product/${productId}/images/${imageIndex}`);
  }
}
