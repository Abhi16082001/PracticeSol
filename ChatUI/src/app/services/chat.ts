import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: HubConnection;
  public messageReceived = new Subject<{ user: string; message: string }>();

  public startConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7084/chatHub') // Your API URL
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error: ', err));

    this.hubConnection.on('ReceiveMessage', (user, message) => {
      this.messageReceived.next({ user, message });
    });
  }

  public sendMessage(user: string, message: string) {
    this.hubConnection
      .invoke('SendMessage', user, message)
      .catch(err => console.error(err));
  }
}
