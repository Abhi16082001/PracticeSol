import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-chat',
   standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})

export class Chat implements OnInit {
  message: string = '';
  messages: any[] = [];
  user: string = 'User' + Math.floor(Math.random() * 1000);

  constructor(private signalRService: ChatService) {}

  ngOnInit() {
    this.signalRService.startConnection();
    this.signalRService.messageReceived.subscribe(msg => {
      this.messages.push(msg);
    });
  }

  sendMessage() {
    if (this.message.trim()) {
      this.signalRService.sendMessage(this.user, this.message);
      this.message = '';
    }
  }
}
