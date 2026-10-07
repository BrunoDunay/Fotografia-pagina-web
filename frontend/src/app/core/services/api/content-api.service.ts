import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, concat, concatMap } from 'rxjs';
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

interface VideoUploadTicket {
  uploadUrl: string;
  fields: Record<string, string | number | boolean>;
}

/**
 * Envío con XMLHttpRequest: es el único que informa el avance de una subida
 * (el HttpClient de la app usa fetch, que no lo hace).
 */
function sendToStorage(ticket: VideoUploadTicket, file: File): Observable<number | { publicId: string }> {
  return new Observable((subscriber) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(ticket.fields)) form.append(key, String(value));
    form.append('file', file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', ticket.uploadUrl);
    xhr.responseType = 'json';
    xhr.upload.onprogress = (event) => {
      // Se reserva el 100 para cuando el almacenamiento confirma que lo recibió.
      if (event.lengthComputable) subscriber.next(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onload = () => {
      const body = xhr.response as { public_id?: string; error?: { message?: string } } | null;
      if (xhr.status >= 200 && xhr.status < 300 && body?.public_id) {
        subscriber.next({ publicId: body.public_id });
        subscriber.complete();
      } else {
        subscriber.error(new Error(body?.error?.message ? `No se pudo subir el video: ${body.error.message}` : 'No se pudo subir el video.'));
      }
    };
    xhr.onerror = () => subscriber.error(new Error('Se perdió la conexión mientras se subía el video. Intenta de nuevo.'));
    xhr.send(form);
    return () => xhr.abort();
  });
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

  /**
   * Sube un video directo al almacenamiento (no pasa por nuestra API: pesa demasiado) y luego lo registra.
   * Emite el avance (0-100) y, al final, el video ya registrado.
   */
  uploadVideo(file: File): Observable<number | Media> {
    return this.http.post<VideoUploadTicket>(`${this.api}/media/video-signature`, {}).pipe(
      concatMap((ticket) => sendToStorage(ticket, file)),
      concatMap((step) =>
        typeof step === 'number' ? [step] : concat([100], this.http.post<Media>(`${this.api}/media/video`, { publicId: step.publicId })),
      ),
    );
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
    return this.http.get<{ mode: 'off' | 'manual' | 'auto'; manualThemeId: string | null; activeThemeId: string | null; nextAuto: { themeId: string; date: string } | null; themes: unknown[] }>(
      `${this.api}/themes`,
    );
  }

  setThemeMode(mode: 'off' | 'manual' | 'auto', manualThemeId?: string | null) {
    return this.http.put(`${this.api}/themes/mode`, { mode, manualThemeId });
  }

  updateTheme(id: string, body: unknown) {
    return this.http.put(`${this.api}/themes/${id}`, body);
  }


  // ---- Legales ----
  legalDocuments() {
    return this.http.get<LegalDocument[]>(`${this.api}/legal`);
  }

  updateLegal(type: LegalType, body: Partial<LegalDocument>) {
    return this.http.put<LegalDocument>(`${this.api}/legal/${type}`, body);
  }
}
