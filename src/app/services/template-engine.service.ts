import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { TEMPLATE_REGISTRY } from '../modules/builder/templates/template-registry';

export interface TemplateRenderRequest {
  templateId: string;
  resumeData: Record<string, unknown>;
  customization?: Record<string, string>;
}

export interface TemplateRenderResponse {
  templateId: string;
  renderedHtml: string;
  success: boolean;
  errorMessage?: string;
}

/** Mirror of section-service ResumeData — all optional for partial usage */
export interface ResumeData {
  personalInfo?: Record<string, unknown>;
  summary?: string;
  experience?: Record<string, unknown>[];
  education?: Record<string, unknown>[];
  skills?: string[];
  certifications?: Record<string, unknown>[];
  projects?: Record<string, unknown>[];
}

@Injectable({ providedIn: 'root' })
export class TemplateEngineService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/v1/templates`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Helper to resolve the Angular component for a template key
   */
  getTemplateComponent(templateKey: string): any {
    const component = TEMPLATE_REGISTRY[templateKey];
    if (!component) {
      console.warn(`Template component not found for key: ${templateKey}. Falling back to modern-template.`);
      return TEMPLATE_REGISTRY['modern-template'];
    }
    return component;
  }

  getTemplates(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTemplateById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getPopularTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/popular`);
  }

  getCustomizationSchema(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/customization-schema`);
  }

  /**
   * Stub for backward compatibility or future use, as UI will now use dynamic components directly.
   */
  renderWithData(templateId: string, data?: ResumeData): Observable<string> {
    console.warn('renderWithData is deprecated. Use getTemplateComponent for UI rendering.');
    return of('<div style="padding:20px; text-align:center;">Angular Component Preview Not Loaded</div>');
  }

  renderWithDataAndCustomization(templateId: string, data: ResumeData, customization: Record<string, string>): Observable<string> {
    console.warn('renderWithDataAndCustomization is deprecated. Use getTemplateComponent for UI rendering.');
    return of('<div style="padding:20px; text-align:center;">Angular Component Preview Not Loaded</div>');
  }
}
