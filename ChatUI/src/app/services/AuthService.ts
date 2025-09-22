import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/User.js';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7084/api/account'; //  replace with your backend URL

  constructor(private http: HttpClient) {}

  login(data: { userid: number; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }

register(data:User):Observable<any>{
  return this.http.post<any>(`${this.apiUrl}/register`,data);
}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

 
}
