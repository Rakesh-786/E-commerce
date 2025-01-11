import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Banner } from '../../shared/models/banner.model';
import { environment } from '../../../environments/environment';

export interface BannerFilters {
  position?: string;
  targetAudience?: string;
  includeInactive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = `${environment.apiUrl}/banners`;

  constructor(private http: HttpClient) { }

  getBanners(filters: BannerFilters = {}): Observable<Banner[]> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<Banner[]>(this.apiUrl, { params });
  }

  getBannerById(id: string): Observable<Banner> {
    return this.http.get<Banner>(`${this.apiUrl}/${id}`);
  }

  getBannersByPosition(position: string, targetAudience?: string): Observable<Banner[]> {
    return this.getBanners({ position, targetAudience });
  }

  createBanner(banner: Partial<Banner>): Observable<{ message: string; banner: Banner }> {
    return this.http.post<{ message: string; banner: Banner }>(this.apiUrl, banner);
  }

  updateBanner(id: string, banner: Partial<Banner>): Observable<{ message: string; banner: Banner }> {
    return this.http.put<{ message: string; banner: Banner }>(`${this.apiUrl}/${id}`, banner);
  }

  deleteBanner(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  trackClick(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/click`, {});
  }

  trackImpression(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/impression`, {});
  }

  uploadBannerImage(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('banner', image);
    
    return this.http.post(`${environment.apiUrl}/upload/banner`, formData);
  }
}
