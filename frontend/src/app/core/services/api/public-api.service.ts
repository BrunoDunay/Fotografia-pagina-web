import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../../config/api.config';
import { Paginated } from '../../types/common.model';
import { Faq, GalleryImage, LegalDocument, LegalType, ServicePage, ServiceSummary, StudioPackage } from '../../types/catalog.model';
import { AvailabilityResponse, PublicReservation } from '../../types/agenda.model';

/** Endpoints públicos (sin sesión). Se usan desde el sitio y se renderizan en SSR. */
@Injectable({ providedIn: 'root' })
export class PublicApiService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);

  services() {
    return this.http.get<ServiceSummary[]>(`${this.api}/services`);
  }

  service(slug: string) {
    return this.http.get<ServicePage>(`${this.api}/services/${encodeURIComponent(slug)}`);
  }

  packages(serviceSlug?: string) {
    const params = serviceSlug ? new HttpParams().set('service', serviceSlug) : undefined;
    return this.http.get<StudioPackage[]>(`${this.api}/packages`, { params });
  }

  galleryImages(serviceSlug: string, page = 1, limit = 24) {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<Paginated<GalleryImage>>(`${this.api}/galleries/${encodeURIComponent(serviceSlug)}/images`, { params });
  }

  faqs(serviceSlug?: string) {
    const params = serviceSlug ? new HttpParams().set('service', serviceSlug) : undefined;
    return this.http.get<Faq[]>(`${this.api}/faqs`, { params });
  }

  availability(from: string, to: string) {
    return this.http.get<AvailabilityResponse>(`${this.api}/availability`, { params: { from, to } });
  }

  reservation(code: string) {
    return this.http.get<PublicReservation>(`${this.api}/reservations/${encodeURIComponent(code)}`);
  }

  legal(type: LegalType) {
    return this.http.get<LegalDocument>(`${this.api}/legal/${type}`);
  }

  legalPdfUrl(type: LegalType): string {
    return `${this.api}/legal/${type}/pdf`;
  }
}
