import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/AuthService.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '../services/chat.js';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  loginData = { userid: 0, password: '' };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router,private chatService: ChatService) {}

  async onLogin() {
    this.chatService.logout();
    this.authService.login(this.loginData).subscribe({
      next: async (response) => {
        // Save JWT in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user',JSON.stringify(response.user));
if (!this.loginData.userid) return;


    await this.chatService.startConnection();  // ✅ start hub connection
      await this.chatService.register(response.user); // ✅ safe register after connected

      this.router.navigate(['/chat'], { state: { registered: true } });
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
      },
    });
  }
}
