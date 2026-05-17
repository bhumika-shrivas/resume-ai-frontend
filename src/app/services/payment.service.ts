import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiBaseUrl}/api/v1/payments`;

  constructor(private http: HttpClient) {}

  createOrder(amount: number): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/create-order`, { amount });
  }

  verifyPayment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, data);
  }

  verifyOtp(otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { otp });
  }

  resendOtp(): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-otp`, {});
  }
}
