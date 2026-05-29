import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Resume {
  id?: number;
  title: string;
  // Personal Info (shown on the resume document)
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  // Resume metadata
  targetJobTitle?: string;
  summary?: string;
  templateId?: string;
  customization?: any;
  atsScore?: number;
  status?: string;       // DRAFT | COMPLETE
  language?: string;
  isPublic?: boolean;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Section {
  sectionId?: number;    // PK from section-service
  id?: number;           // alias used in template bindings
  resumeId: number;
  sectionType: string;   // SUMMARY | EXPERIENCE | EDUCATION | SKILLS | CERTIFICATIONS | PROJECTS | LANGUAGES | VOLUNTEER | CUSTOM
  title: string;
  content?: string;      // rich text / JSON content
  displayOrder?: number;
  isVisible?: boolean;
  aiGenerated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface AiRequest {
  requestId: string;
  userId: string;
  resumeId?: number;
  requestType: string;
  inputPrompt: string;
  aiResponse: string;
  model: string;
  tokensUsed: number;
  status: string;
  createdAt: string;
  completedAt?: string;
}

export interface ExportJob {
  jobId: string;
  resumeId: number;
  userId: string;
  format: string;
  status: string;
  fileUrl?: string;
  fileSizeKb?: number;
  requestedAt: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface JobMatch {
  matchId?: number;
  resumeId: number;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  matchScore: number;
  missingSkills?: string;
  recommendations?: string;
  source: string;
  matchedAt: string;
  isBookmarked: boolean;
}

export interface Notification {
  notificationId: number;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  channel?: string;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  sentAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResumeService {
  private readonly resumeUrl  = `${environment.apiBaseUrl}/api/v1/resumes`;
  private readonly sectionUrl = `${environment.apiBaseUrl}/api/v1/sections`;
  private readonly templateUrl = `${environment.apiBaseUrl}/api/v1/templates`;
  private readonly aiUrl = `${environment.apiBaseUrl}/api/v1/ai`;
  private readonly exportUrl = `${environment.apiBaseUrl}/api/v1/exports`;
  private readonly jobMatchUrl = `${environment.apiBaseUrl}/api/v1/job-matches`;
  private readonly notificationUrl = `${environment.apiBaseUrl}/api/v1/notifications`;

  // Simple in-memory cache — invalidated on mutations
  private resumesCache$: Observable<Resume[]> | null = null;
  private resumeCache  = new Map<number, Observable<Resume>>();

  constructor(private readonly http: HttpClient) {}

  public invalidateListCache(): void {
    this.resumesCache$ = null;
  }

  private invalidateResumeCache(id: number) {
    this.resumeCache.delete(id);
    this.invalidateListCache();
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  getResumes(): Observable<Resume[]> {
    if (!this.resumesCache$) {
      this.resumesCache$ = this.http.get<Resume[]>(this.resumeUrl).pipe(shareReplay(1));
    }
    return this.resumesCache$;
  }

  getResume(id: number): Observable<Resume> {
    if (!this.resumeCache.has(id)) {
      const req$ = this.http.get<Resume>(`${this.resumeUrl}/${id}`).pipe(shareReplay(1));
      this.resumeCache.set(id, req$);
    }
    return this.resumeCache.get(id)!;
  }

  createResume(resume: Resume): Observable<Resume> {
    return this.http.post<Resume>(this.resumeUrl, resume).pipe(
      tap(() => this.invalidateListCache())
    );
  }

  updateResume(id: number, resume: Resume): Observable<Resume> {
    return this.http.put<Resume>(`${this.resumeUrl}/${id}`, resume).pipe(
      tap(updated => {
        // Update cache entry with fresh data
        this.resumeCache.set(id, of(updated).pipe(shareReplay(1)));
        this.invalidateListCache();
      })
    );
  }

  deleteResume(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resumeUrl}/${id}`);
  }

  // ── DUPLICATE ─────────────────────────────────────────────────────────────

  duplicateResume(id: number): Observable<Resume> {
    return this.http.post<Resume>(`${this.resumeUrl}/${id}/duplicate`, {});
  }

  // ── ATS SCORE ─────────────────────────────────────────────────────────────

  updateAtsScore(id: number, score: number): Observable<Resume> {
    return this.http.put<Resume>(`${this.resumeUrl}/${id}/ats-score`, { score }).pipe(
      tap(updated => {
        this.resumeCache.set(id, of(updated).pipe(shareReplay(1)));
        this.invalidateListCache();
      })
    );
  }


  // ── PUBLIC GALLERY ────────────────────────────────────────────────────────

  getPublicResumes(): Observable<Resume[]> {
    return this.http.get<Resume[]>(`${this.resumeUrl}/public`);
  }

  incrementViewCount(id: number): Observable<Resume> {
    return this.http.put<Resume>(`${this.resumeUrl}/${id}/view`, {});
  }

  // ── BY TEMPLATE ───────────────────────────────────────────────────────────

  getResumesByTemplate(templateId: string): Observable<Resume[]> {
    return this.http.get<Resume[]>(`${this.resumeUrl}/template/${templateId}`);
  }

  // ── STATS ─────────────────────────────────────────────────────────────────

  getResumeCount(): Observable<number> {
    return this.http.get<number>(`${this.resumeUrl}/count`);
  }

  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.resumeUrl}/admin/stats`);
  }

  // ── SECTIONS ──────────────────────────────────────────────────────────────

  getSections(resumeId: number): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.sectionUrl}/resume/${resumeId}`);
  }

  getSectionById(id: number): Observable<Section> {
    return this.http.get<Section>(`${this.sectionUrl}/${id}`);
  }

  getSectionsByType(resumeId: number, type: string): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.sectionUrl}/resume/${resumeId}/type/${type}`);
  }

  getAiGeneratedSections(resumeId: number): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.sectionUrl}/resume/${resumeId}/ai`);
  }

  createSection(section: Section): Observable<Section> {
    return this.http.post<Section>(this.sectionUrl, section);
  }

  updateSection(id: number, section: Section): Observable<Section> {
    return this.http.put<Section>(`${this.sectionUrl}/${id}`, section);
  }

  deleteSection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sectionUrl}/${id}`);
  }

  deleteAllSections(resumeId: number): Observable<void> {
    return this.http.delete<void>(`${this.sectionUrl}/resume/${resumeId}`);
  }

  reorderSections(resumeId: number, sections: Section[]): Observable<Section[]> {
    return this.http.put<Section[]>(`${this.sectionUrl}/resume/${resumeId}/reorder`, sections);
  }

  toggleSectionVisibility(id: number): Observable<Section> {
    return this.http.put<Section>(`${this.sectionUrl}/${id}/visibility`, {});
  }

  setAiFlag(id: number, aiGenerated: boolean): Observable<Section> {
    return this.http.put<Section>(`${this.sectionUrl}/${id}/ai-flag`, { aiGenerated });
  }

  bulkUpdateSections(resumeId: number, sections: Section[]): Observable<Section[]> {
    return this.http.put<Section[]>(`${this.sectionUrl}/resume/${resumeId}/bulk`, sections);
  }

  updateSectionOrder(sections: Section[]): Observable<Section[]> {
    return this.http.patch<Section[]>(`${this.sectionUrl}/order`, sections);
  }

  /**
   * Fetch fully assembled ResumeData from section-service /aggregate endpoint.
   * Used by the live preview and PDF export flows.
   */
  aggregateResume(resumeId: number): Observable<any> {
    return this.http.get<any>(`${this.sectionUrl}/resume/${resumeId}/aggregate`);
  }

  // ── EXPORT ────────────────────────────────────────────────────────────────

  exportPdf(resumeId: number, data: any): Observable<ExportJob> {
    return this.http.post<ExportJob>(`${this.exportUrl}/pdf/${resumeId}`, data);
  }

  exportDocx(resumeId: number, data: any): Observable<ExportJob> {
    return this.http.post<ExportJob>(`${this.exportUrl}/docx/${resumeId}`, data);
  }

  /**
   * Synchronous PDF export — returns a Blob for immediate download.
   */
  exportPdfDirect(resumeId: number, templateId: string, filename = 'resume.pdf', htmlContent?: string): Observable<Blob> {
    return this.http.post(
      `${this.exportUrl}/pdf/direct`,
      { resumeId, templateId, filename, htmlContent },
      { responseType: 'blob' }
    );
  }

  /**
   * Synchronous PDF preview — returns a Blob opened inline in browser.
   */
  previewPdf(resumeId: number, templateId: string): Observable<Blob> {
    return this.http.post(
      `${this.exportUrl}/pdf/preview`,
      { resumeId, templateId },
      { responseType: 'blob' }
    );
  }

  getExportStatus(jobId: string): Observable<ExportJob> {
    return this.http.get<ExportJob>(`${this.exportUrl}/status/${jobId}`);
  }

  // ── JOB MATCHING ──────────────────────────────────────────────────────────

  analyzeJobFit(resumeId: number, jobTitle: string, jobDescription: string, source?: string): Observable<JobMatch> {
    return this.http.post<JobMatch>(`${this.jobMatchUrl}/analyze`, { resumeId, jobTitle, jobDescription, source });
  }

  getMatchesByResume(resumeId: number): Observable<JobMatch[]> {
    return this.http.get<JobMatch[]>(`${this.jobMatchUrl}/resume/${resumeId}`);
  }

  getMatchesByUser(userId: string): Observable<JobMatch[]> {
    return this.http.get<JobMatch[]>(`${this.jobMatchUrl}/user/${userId}`);
  }

  getMatchById(matchId: number): Observable<JobMatch> {
    return this.http.get<JobMatch>(`${this.jobMatchUrl}/${matchId}`);
  }

  bookmarkMatch(matchId: number, isBookmarked: boolean): Observable<JobMatch> {
    return this.http.post<JobMatch>(`${this.jobMatchUrl}/bookmark/${matchId}?isBookmarked=${isBookmarked}`, {});
  }

  fetchLinkedInJobs(query: string, location: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.jobMatchUrl}/fetchLinkedIn?query=${query}&location=${location}`);
  }

  fetchNaukriJobs(query: string, location: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.jobMatchUrl}/fetchNaukri?query=${query}&location=${location}`);
  }

  getTailoringRecommendations(matchId: number): Observable<string> {
    return this.http.get(`${this.jobMatchUrl}/recommendations/${matchId}`, { responseType: 'text' });
  }

  getTopMatches(): Observable<JobMatch[]> {
    return this.http.get<JobMatch[]>(`${this.jobMatchUrl}/top`);
  }

  deleteMatch(matchId: number): Observable<void> {
    return this.http.delete<void>(`${this.jobMatchUrl}/${matchId}`);
  }

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────

  getNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.notificationUrl}/recipient/${userId}`);
  }

  markNotificationAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.notificationUrl}/mark-read/${id}`, {});
  }

  markAllNotificationsRead(): Observable<void> {
    return this.http.post<void>(`${this.notificationUrl}/mark-all-read`, {});
  }

  getUnreadNotificationCount(): Observable<number> {
    return this.http.get<number>(`${this.notificationUrl}/unread-count`);
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.notificationUrl}/${id}`);
  }

  // ── TEMPLATES ─────────────────────────────────────────────────────────────

  getTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(this.templateUrl);
  }

  getAdminAllTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(this.templateUrl);
  }

  getFreeTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(`${this.templateUrl}/free`);
  }

  getPremiumTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(`${this.templateUrl}/premium`);
  }

  getTemplatesByCategory(category: string): Observable<Template[]> {
    return this.http.get<Template[]>(`${this.templateUrl}/category/${category}`);
  }

  getTemplateById(id: string): Observable<Template> {
    return this.http.get<Template>(`${this.templateUrl}/${id}`);
  }

  getPopularTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(`${this.templateUrl}/popular`);
  }

  incrementTemplateUsage(id: string): Observable<void> {
    return this.http.post<void>(`${this.templateUrl}/${id}/usage`, {});
  }

  createTemplate(template: Template): Observable<Template> {
    return this.http.post<Template>(this.templateUrl, template);
  }

  updateTemplate(id: string, template: Template): Observable<Template> {
    return this.http.put<Template>(`${this.templateUrl}/${id}`, template);
  }

  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.templateUrl}/${id}`);
  }

  deactivateTemplate(id: string): Observable<void> {
    return this.http.put<void>(`${this.templateUrl}/${id}/deactivate`, {});
  }

  // ── AI ────────────────────────────────────────────────────────────────────

  generateAiSummary(resumeId: number, role: string, experience: string, currentSummary: string = ''): Observable<string> {
    return this.http.post(`${this.aiUrl}/generateSummary`, { resumeId, role, experience, currentSummary }, { responseType: 'text' });
  }

  generateAiBullets(resumeId: number, role: string, description: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.aiUrl}/generateBullets`, { resumeId, role, description });
  }

  improveSectionWithAi(resumeId: number, sectionContent: string): Observable<string> {
    return this.http.post(`${this.aiUrl}/improveSection`, { resumeId, sectionContent }, { responseType: 'text' });
  }

  checkAtsScore(resumeId: number, jobDescription: string, resumeData?: any): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/checkAts`, { resumeId, jobDescription, resumeData });
  }

  suggestSkills(resumeId: number, roleOrIndustry: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.aiUrl}/suggestSkills`, { resumeId, roleOrIndustry });
  }

  getAiQuota(): Observable<number> {
    return this.http.get<number>(`${this.aiUrl}/quota`);
  }

  // ── EXPORT ────────────────────────────────────────────────────────────────

  exportDocxDirect(data: any): Observable<Blob> {
    return this.http.post(`${environment.apiBaseUrl}/api/v1/exports/docx/direct`, data, { responseType: 'blob' });
  }

  exportJsonDirect(data: any): Observable<Blob> {
    return this.http.post(`${environment.apiBaseUrl}/api/v1/exports/json/direct`, data, { responseType: 'blob' });
  }

  trackExport(resumeId: number, format: string = 'PDF'): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/api/v1/exports/track`, { resumeId, format });
  }

  getAiHistory(): Observable<AiRequest[]> {
    return this.http.get<AiRequest[]>(`${this.aiUrl}/history`);
  }

  generateCoverLetter(resumeId: number, payload: { jobDescription: string }): Observable<string> {
    return this.http.post(`${this.aiUrl}/generateCoverLetter`, { resumeId, jobDetails: { jobDescription: payload.jobDescription } }, { responseType: 'text' });
  }

  tailorForJob(resumeId: number, jobDescription: string): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/tailorForJob`, { resumeId, jobDescription });
  }

  translateResume(resumeId: number, targetLanguage: string): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/translate`, { resumeId, targetLanguage });
  }
}
