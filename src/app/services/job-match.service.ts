import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface JobMatch {
  matchId?: number;
  resumeId: number;
  userId: string;
  jobTitle: string;
  companyName?: string;
  location?: string;
  jobDescription: string;
  matchScore: number;
  missingSkills: string;
  recommendations: string;
  isBookmarked: boolean;
  matchedAt: string;
  source: string;
  jobUrl?: string;
  salary?: string;
  postedAt?: string;
}

export interface LiveJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  postedAt?: string;
  source: 'LINKEDIN';
}

export interface AiRequest {
  requestId: string;
  userId: string;
  resumeId?: number;
  requestType: string;
  inputPrompt?: string;
  aiResponse?: string;
  model?: string;
  tokensUsed?: number;
  status: string;
  createdAt: string;
  completedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class JobMatchService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/job-matches`;
  private readonly aiUrl = `${environment.apiBaseUrl}/api/v1/ai`;

  constructor(private readonly http: HttpClient) {}

  analyzeJobFit(payload: {
    resumeId: number;
    jobTitle: string;
    jobDescription: string;
    source: string;
    companyName?: string;
    location?: string;
    jobUrl?: string;
  }): Observable<JobMatch> {
    return this.http.post<JobMatch>(`${this.baseUrl}/analyze`, payload);
  }

  getTopMatches(limit: number = 20): Observable<JobMatch[]> {
    return this.http.get<JobMatch[]>(`${this.baseUrl}/top?limit=${limit}`);
  }

  bookmarkMatch(matchId: number, isBookmarked: boolean): Observable<JobMatch> {
    return this.http.post<JobMatch>(`${this.baseUrl}/bookmark/${matchId}?isBookmarked=${isBookmarked}`, {});
  }

  getBookmarks(): Observable<JobMatch[]> {
    return this.http.get<JobMatch[]>(`${this.baseUrl}/bookmarks`);
  }

  fetchLinkedIn(query: string, location: string): Observable<LiveJob[]> {
    return this.http.get<LiveJob[]>(`${this.baseUrl}/fetchLinkedIn?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  }

  saveJobDirectly(job: LiveJob): Observable<JobMatch> {
    return this.http.post<JobMatch>(`${this.baseUrl}/save-job`, {
      jobTitle: job.title,
      jobDescription: job.description,
      source: job.source,
      companyName: job.company,
      location: job.location,
      jobUrl: job.url,
      salary: job.salary,
      postedAt: job.postedAt
    });
  }

  deleteMatch(matchId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${matchId}`);
  }

  getAiHistory(): Observable<AiRequest[]> {
    return this.http.get<AiRequest[]>(`${this.aiUrl}/history`);
  }
}
