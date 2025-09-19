import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/AuthService.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '../services/chat.js';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  loginData = { username: '', password: '' };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router,private chatService: ChatService) {}

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        // Save JWT in localStorage
        localStorage.setItem('token', response.token);
if (!this.loginData.username) return;
    this.chatService.register(this.loginData.username);
    // this.registered = true;
        // Redirect after login (example: chat page)
        this.router.navigate(['/chat'],{ state: { registered: true } });
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
      },
    });
  }
}
