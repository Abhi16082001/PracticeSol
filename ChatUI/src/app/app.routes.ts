import { Routes } from '@angular/router';
import { Chat } from './chat/chat.js';
import { Login } from './login/login.js';
export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'chat', component: Chat },
  { path: 'login', component: Login },
  { path: '**', redirectTo: 'login' } // wildcard for unknown routes

];
