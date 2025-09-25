
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './AuthService.js';
import { User } from '../models/User.js';
@Injectable({ providedIn: 'root' })
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  private user:User= {
    uid:0,
      uname:"",
      email:"",
      phone:0,
      fname:"",
      lname:"",
      password:"",
      dob:null
} ;

  public onlineUsers$ = new BehaviorSubject<User[]>([]);
  public messages$ = new BehaviorSubject<{ from: User, message: string, to: User }[]>([]);

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
  .withUrl('https://localhost:7084/chathub', {
    accessTokenFactory: () => localStorage.getItem('token') || ""
  })
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
    this.hubConnection.on('ReceivePrivateMessage', (fromUser: User, message: string) => {
      const current = this.messages$.getValue();
      this.messages$.next([...current, { from: fromUser, message, to: this.user }]);
    });

 this.hubConnection.on('UpdateUserList', (users: User[]) => {
   console.log('Received from server:', users); // now should be objects
  // const mapped = users.map(u => ({ userid: u.userid, username: u.username }));
  this.onlineUsers$.next(users.filter(u => u.uname !== this.user.uname));
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
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('RegisterUser', this.user.uname);
    }
  }
// this is just for getting the username not for persisting the user details
  public getuser() {
    if (!this.user) {
      const usr = localStorage.getItem('user');
      if (usr) {
        this.user = JSON.parse(usr).uname;
      }
    }
    return this.user;
  }
// this is for re-registering the user after the connection is dropped
  private async restoreUser() {
    const usr = localStorage.getItem('user');
    if (usr) {
      const user = JSON.parse(usr);
      this.user = user;
      await this.hubConnection.invoke('RegisterUser', this.user.uname);
    }
  }

  public async sendMessage(toUser: User, message: string) {
    if (!this.user) this.restoreUser();
    await this.hubConnection.invoke('SendPrivateMessage', this.user, toUser, message);
    const current = this.messages$.getValue();
    this.messages$.next([...current, { from: this.user, message:message, to: toUser }]);
  }

  // ✅ Stop connection on logout
  public async logout(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      console.log('SignalR connection stopped');
    }
    this.onlineUsers$.next([]);
    this.messages$.next([]);
    this.user = {
     uid:0,
      uname:"",
      email:"",
      phone:0,
      fname:"",
      lname:"",
      password:"",
      dob:null
};
        localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
