// import { Component, OnInit } from '@angular/core';
// import { ChatService } from '../services/chat.js';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// @Component({
//   selector: 'app-chat',
//    standalone: true,
//   imports: [FormsModule,CommonModule],
//   templateUrl: './chat.html',
//   styleUrls: ['./chat.css']
// })

// export class Chat implements OnInit {
//   message: string = '';
//   messages: any[] = [];
//   user: string = 'User' + Math.floor(Math.random() * 1000);

//   constructor(private signalRService: ChatService) {}

//   ngOnInit() {
//     this.signalRService.startConnection();
//     this.signalRService.messageReceived.subscribe(msg => {
//       this.messages.push(msg);
//     });
//   }

//   sendMessage() {
//     if (this.message.trim()) {
//       this.signalRService.sendMessage(this.user, this.message);
//       this.message = '';
//     }
//   }
// }




import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.js';
import { AuthService } from '../services/AuthService.js';
import { Router } from '@angular/router';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html'
})
export class Chat {
  username = '';
  toUser = '';
  message = '';
  registered = false;
  onlineUsers: string[] = [];
  messages: {from: string, message: string}[] = [];

  constructor(private chatService: ChatService,private router: Router,private authservice:AuthService) {
    this.chatService.onlineUsers$.subscribe(users => this.onlineUsers = users);
    this.chatService.messages$.subscribe(msgs => this.messages = msgs);
    this.registered=this.router.getCurrentNavigation()?.extras.state?.['registered'];
    this.username=this.chatService.getusername();
  }

  // register() {
  //   if (!this.username) return;
  //   this.chatService.register(this.username);
  //   this.registered = true;
  // }

  send() {
    if (!this.toUser || !this.message) return;
    this.chatService.sendMessage(this.toUser, this.message);
    this.message = '';
  }


  logout(){
    this.authservice.logout();
    alert("You are logged out !!");
    this.router.navigate(['/login']);
  }
}
