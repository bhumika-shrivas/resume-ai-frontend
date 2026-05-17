import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/ai`;

  constructor(private readonly http: HttpClient) {}

  generateSummary(experience: string, skills: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/generate-summary`, { experience, skills }, { responseType: 'text' });
  }

  improveBulletPoint(bulletPoint: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/improve`, { bulletPoint }, { responseType: 'text' });
  }

  getAtsScore(resumeText: string, jobDescription: string): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/ats-score`, { resumeText, jobDescription });
  }
}
