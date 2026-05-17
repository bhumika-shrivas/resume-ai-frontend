import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Metadata-only template interface aligned with new backend schema */
export interface Template {
  templateId: string;
  name: string;
  description?: string;
  templateKey: string;
  category: string;
  thumbnailUrl?: string;
  previewImageUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  layoutType?: string;
  isPremium: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/templates`;

  constructor(private readonly http: HttpClient) {}

  getTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(this.baseUrl);
  }

  getTemplate(id: string): Observable<Template> {
    return this.http.get<Template>(`${this.baseUrl}/${id}`);
  }
}
