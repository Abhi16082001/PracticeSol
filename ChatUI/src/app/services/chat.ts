// import { Injectable } from '@angular/core';
// import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

// import { Subject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class ChatService {
//   private hubConnection!: HubConnection;
//   public messageReceived = new Subject<{ user: string; message: string }>();

//   public startConnection() {
//     this.hubConnection = new HubConnectionBuilder()
//       .withUrl('https://localhost:7084/chatHub') // Your API URL
//       .withAutomaticReconnect()
//       .build();

//     this.hubConnection
//       .start()
//       .then(() => console.log('SignalR Connected'))
//       .catch(err => console.error('SignalR Connection Error: ', err));

//     this.hubConnection.on('ReceiveMessage', (user, message) => {
//       this.messageReceived.next({ user, message });
//     });
//   }

//   public sendMessage(user: string, message: string) {
//     this.hubConnection
//       .invoke('SendMessage', user, message)
//       .catch(err => console.error(err));
//   }
// }

import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './AuthService.js';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  private username: string = '';

  public onlineUsers$ = new BehaviorSubject<string[]>([]);
  public messages$ = new BehaviorSubject<{ from: string, message: string, to: string }[]>([]);

  constructor(private authService: AuthService) {
     // If a user exists in localStorage, start the hub connection automatically
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    this.startConnection();
  }
  }

  // ✅ Start connection explicitly after login
  public async startConnection(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('No JWT token found. Please login first.');
      return;
    }

    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return; // already connected
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7084/chatHub', { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.registerHandlers();

    await this.hubConnection.start()
      .then(() => {
        console.log('Connected to chatHub');
        this.restoreUser(); // ✅ auto re-register if refresh
      })
      .catch(err => console.error('SignalR connection error: ', err));

    // Re-register if connection drops and comes back
    this.hubConnection.onreconnected(() => this.restoreUser());
  }

  private registerHandlers() {
    this.hubConnection.on('ReceivePrivateMessage', (fromUser: string, message: string) => {
      const current = this.messages$.getValue();
      this.messages$.next([...current, { from: fromUser, message, to: this.username }]);
    });

    this.hubConnection.on('UpdateUserList', (users: string[]) => {
      this.onlineUsers$.next(users.filter(u => u !== this.username));
    });

    this.hubConnection.on('Registered', (user: string) => {
      console.log(`${user} registered`);
    });

    this.hubConnection.on('UserNotFound', (toUser: string) => {
      alert(`User ${toUser} is offline`);
    });
  }

  // ✅ Called after login
  public async register(user: any) {
    this.username = user.uname;
    localStorage.setItem('user', JSON.stringify(user));
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('RegisterUser', this.username);
    }
  }

  public getusername() {
    if (!this.username) {
      const usr = localStorage.getItem('user');
      if (usr) {
        this.username = JSON.parse(usr).uname;
      }
    }
    return this.username;
  }

  private async restoreUser() {
    const usr = localStorage.getItem('user');
    if (usr) {
      const user = JSON.parse(usr);
      this.username = user.uname;
      await this.hubConnection.invoke('RegisterUser', this.username);
    }
  }

  public async sendMessage(toUser: string, message: string) {
    if (!this.username) this.restoreUser();
    await this.hubConnection.invoke('SendPrivateMessage', this.username, toUser, message);
    const current = this.messages$.getValue();
    this.messages$.next([...current, { from: this.username, message, to: toUser }]);
  }

  // ✅ Stop connection on logout
  public async logout(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      console.log('SignalR connection stopped');
    }
    this.onlineUsers$.next([]);
    this.messages$.next([]);
    this.username = '';
        localStorage.removeItem('token');
    localStorage.removeItem('user');

  }
}
