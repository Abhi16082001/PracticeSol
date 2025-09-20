import { Routes } from '@angular/router';
import { Chat } from './chat/chat.js';
import { Login } from './login/login.js';
import { RegisterComponent } from './register/register.js';
export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'chat', component: Chat },
  { path: 'login', component: Login },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: 'login' } // wildcard for unknown routes

];
