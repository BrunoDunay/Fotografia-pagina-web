import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../config/api.config';
import { Media } from '../../types/common.model';
import { AllSettings, SettingsSection } from '../../types/settings.model';
import { AdminService, Faq, GalleryImage, LegalDocument, LegalType, StudioPackage } from '../../types/catalog.model';

export type MediaFolder = 'site' | 'services' | 'themes' | 'reservations' | 'about';

export interface AdminGallery {
  id: string;
  title: string;
  service: { id: string; slug: string; name: string } | null;
  cover: Media | null;
  maxImages: number;
  images: GalleryImage[];
}

/** Endpoints privados para administrar el contenido del sitio. */
@Injectable({ providedIn: 'root' })
export class ContentApiService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);

  // ---- Configuración ----
  settings() {
    return this.http.get<AllSettings>(`${this.api}/settings`);
  }

  saveSettings<K extends SettingsSection>(section: K, value: AllSettings[K]) {
    return this.http.put<AllSettings[K]>(`${this.api}/settings/${section}`, value);
  }

  // ---- Servicios ----
  services() {
    return this.http.get<AdminService[]>(`${this.api}/services/admin`);
  }

  service(id: string) {
    return this.http.get<AdminService>(`${this.api}/services/admin/${id}`);
  }

  createService(body: unknown) {
    return this.http.post<AdminService>(`${this.api}/services`, body);
  }

  updateService(id: string, body: unknown) {
    return this.http.put<AdminService>(`${this.api}/services/${id}`, body);
  }

  setServiceVisibility(id: string, isVisible: boolean) {
    return this.http.patch(`${this.api}/services/${id}/visibility`, { isVisible });
  }

  reorderServices(ids: string[]) {
    return this.http.put(`${this.api}/services/reorder`, { ids });
  }

  deleteService(id: string) {
    return this.http.delete<void>(`${this.api}/services/${id}`);
  }

  // ---- Paquetes ----
  packages() {
    return this.http.get<StudioPackage[]>(`${this.api}/packages/admin`);
  }

  createPackage(body: unknown) {
    return this.http.post<StudioPackage>(`${this.api}/packages`, body);
  }

  updatePackage(id: string, body: unknown) {
    return this.http.put<StudioPackage>(`${this.api}/packages/${id}`, body);
  }

  setPackageActive(id: string, isActive: boolean) {
    return this.http.patch<StudioPackage>(`${this.api}/packages/${id}/active`, { isActive });
  }

  reorderPackages(ids: string[]) {
    return this.http.put(`${this.api}/packages/reorder`, { ids });
  }

  deletePackage(id: string) {
    return this.http.delete<void>(`${this.api}/packages/${id}`);
  }

  // ---- Galerías ----
  gallery(id: string) {
    return this.http.get<AdminGallery>(`${this.api}/galleries/admin/${id}`);
  }

  /** Con reportProgress para mostrar la barra de subida. */
  uploadGalleryImages(galleryId: string, files: File[]): Observable<HttpEvent<{ uploaded: GalleryImage[]; failed: { name: string; message: string }[] }>> {
    const form = new FormData();
    for (const file of files) form.append('images', file, file.name);
    return this.http.post<{ uploaded: GalleryImage[]; failed: { name: string; message: string }[] }>(
      `${this.api}/galleries/${galleryId}/images`,
      form,
      { reportProgress: true, observe: 'events' },
    );
  }

  updateGallery(galleryId: string, body: { title?: string; maxImages?: number }) {
    return this.http.patch<{ id: string; title: string; maxImages: number }>(`${this.api}/galleries/${galleryId}`, body);
  }

  reorderGallery(galleryId: string, ids: string[]) {
    return this.http.put(`${this.api}/galleries/${galleryId}/order`, { ids });
  }

  setGalleryCover(galleryId: string, imageId: string) {
    return this.http.put(`${this.api}/galleries/${galleryId}/cover`, { imageId });
  }

  deleteGalleryImage(galleryId: string, imageId: string) {
    return this.http.delete<void>(`${this.api}/galleries/${galleryId}/images/${imageId}`);
  }

  // ---- Media suelta (hero, portadas, logo) ----
  uploadMedia(file: File, folder: MediaFolder, alt?: string) {
    const form = new FormData();
    form.append('image', file, file.name);
    form.append('folder', folder);
    if (alt) form.append('alt', alt);
    return this.http.post<Media>(`${this.api}/media`, form);
  }

  deleteMedia(id: string) {
    return this.http.delete<void>(`${this.api}/media/${id}`);
  }

  // ---- FAQ ----
  faqs() {
    return this.http.get<(Faq & { service: { id: string; name: string } | null })[]>(`${this.api}/faqs/admin`);
  }

  createFaq(body: Partial<Faq>) {
    return this.http.post<Faq>(`${this.api}/faqs`, body);
  }

  updateFaq(id: string, body: Partial<Faq>) {
    return this.http.put<Faq>(`${this.api}/faqs/${id}`, body);
  }

  reorderFaqs(ids: string[]) {
    return this.http.put(`${this.api}/faqs/reorder`, { ids });
  }

  deleteFaq(id: string) {
    return this.http.delete<void>(`${this.api}/faqs/${id}`);
  }

  // ---- Temas ----
  themes() {
    return this.http.get<{ mode: 'off' | 'manual' | 'auto'; manualThemeId: string | null; activeThemeId: string | null; themes: unknown[] }>(
      `${this.api}/themes`,
    );
  }

  setThemeMode(mode: 'off' | 'manual' | 'auto', manualThemeId?: string | null) {
    return this.http.put(`${this.api}/themes/mode`, { mode, manualThemeId });
  }

  createTheme(body: unknown) {
    return this.http.post(`${this.api}/themes`, body);
  }

  updateTheme(id: string, body: unknown) {
    return this.http.put(`${this.api}/themes/${id}`, body);
  }

  deleteTheme(id: string) {
    return this.http.delete<void>(`${this.api}/themes/${id}`);
  }

  // ---- Legales ----
  legalDocuments() {
    return this.http.get<LegalDocument[]>(`${this.api}/legal`);
  }

  updateLegal(type: LegalType, body: Partial<LegalDocument>) {
    return this.http.put<LegalDocument>(`${this.api}/legal/${type}`, body);
  }
}
