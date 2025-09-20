import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../services/AuthService.js';
import { Router } from '@angular/router';
import { User } from '../models/User.js';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  user: User = {
    Uid: 0,
    Uname: '',
    Email: '',
    Phone: 0,
    Fname: '',
    Lname: '',
    Password: '',
    DOB: new Date()
  };

  confirmPassword: string = '';
  dobError: boolean = false;

  constructor(private authService: AuthService,private router: Router) {}

  // Custom DOB validator
  validateDOB() {
    if (!this.user.DOB) {
      this.dobError = true;
      return;
    }
    const today = new Date();
    const dob = new Date(this.user.DOB);
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      // hasn't had birthday this year yet
      this.dobError = (age - 1) < 18;
    } else {
      this.dobError = age < 18;
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid || this.dobError || this.user.Password !== this.confirmPassword) {
      return;
    }
console.log("Form is submitted !");
    this.authService.register(this.user).subscribe({
      next: (res) => {
        if(res.status){
        console.log('User registered successfully', res);
        alert('Registration successful!');
        form.reset();        
        this.router.navigate(['/login']);}
        else{
           console.log('Some error occured !!', res);
        }
      },
      error: (err) => {
        console.error('Registration failed', err);
        alert('Registration failed!');
      }
    });
  }
}
