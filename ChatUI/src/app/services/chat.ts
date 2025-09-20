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
import { User } from '../models/User.js';
@Injectable({ providedIn: 'root' })
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  private username: string = '';

// Optional helper to check token expiration
private isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch {
    return true; // treat invalid token as expired
  }
}

  // Online users list
  public onlineUsers$ = new BehaviorSubject<string[]>([]);
  // Incoming messages
  public messages$ = new BehaviorSubject<{from: string, message: string, to:string}[]>([]);

  constructor(private authService: AuthService) {

 const token = this.authService.getToken();

  if (!token) {
    console.warn('No JWT token found. Please login first.');
    return; // stop connection if token is missing
  }

// Optionally, you can validate token format or expiration here
  const isTokenExpired = this.isTokenExpired(token);
  if (isTokenExpired) {
    console.warn('JWT token expired. Please login again.');
    return;
  }
  else {
    console.log("JWT token is validated !!");
  }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7084/chatHub', { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('Connected to chatHub'))
      .catch(err => console.error(err));

    // Incoming private messages
    this.hubConnection.on('ReceivePrivateMessage', (fromUser: string, message: string) => {
      const current = this.messages$.getValue();
      this.messages$.next([...current, { from: fromUser, message:message, to:this.username }]);
    });

    // Online users list update
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

  register(user:any) {
    this.username = user.uname;
    this.hubConnection.invoke('RegisterUser', this.username);
  }
getusername(){
  return this.username;
}

  sendMessage(toUser: string, message: string) {
    this.hubConnection.invoke('SendPrivateMessage', this.username, toUser, message);
        const current = this.messages$.getValue();
       this.messages$.next([...current, { from: this.username, message:message, to:toUser }]);
  }
}


