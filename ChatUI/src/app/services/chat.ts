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

@Injectable({ providedIn: 'root' })
export class ChatService {
  private hubConnection: signalR.HubConnection;
  private username: string = '';

  // Online users list
  public onlineUsers$ = new BehaviorSubject<string[]>([]);
  // Incoming messages
  public messages$ = new BehaviorSubject<{from: string, message: string}[]>([]);

  constructor() {
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
      this.messages$.next([...current, { from: fromUser, message }]);
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

  register(username: string) {
    this.username = username;
    this.hubConnection.invoke('RegisterUser', username);
  }

  sendMessage(toUser: string, message: string) {
    this.hubConnection.invoke('SendPrivateMessage', this.username, toUser, message);
  }
}
