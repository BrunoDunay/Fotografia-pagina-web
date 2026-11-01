import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../../config/api.config';
import { AdminReview, AdminReviewList, ReviewPage, ReviewStatus, ReviewSubmission, ReviewUpdate } from '../../types/review.model';

/** Reseñas: lectura y envío públicos; moderación desde el panel (con sesión). */
@Injectable({ providedIn: 'root' })
export class ReviewsApiService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);

  published(page = 1, limit = 12) {
    return this.http.get<ReviewPage>(`${this.api}/reviews`, { params: new HttpParams().set('page', page).set('limit', limit) });
  }

  submit(review: ReviewSubmission) {
    const form = new FormData();
    form.set('authorName', review.authorName);
    form.set('eventLabel', review.eventLabel);
    form.set('rating', String(review.rating));
    form.set('comment', review.comment);
    form.set('website', review.website);
    form.set('elapsedMs', String(Math.round(review.elapsedMs)));
    if (review.photo) form.set('photo', review.photo, review.photo.name);
    return this.http.post<{ status: 'pending' }>(`${this.api}/reviews`, form);
  }

  // ---- Panel ----

  adminList(status?: ReviewStatus) {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<AdminReviewList>(`${this.api}/reviews/admin`, { params });
  }

  update(id: string, body: ReviewUpdate) {
    return this.http.patch<AdminReview>(`${this.api}/reviews/${id}`, body);
  }

  removePhoto(id: string) {
    return this.http.delete<AdminReview>(`${this.api}/reviews/${id}/photo`);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.api}/reviews/${id}`);
  }
}
