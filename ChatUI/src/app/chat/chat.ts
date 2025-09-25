// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ChatService } from '../services/chat.js';
// import { AuthService } from '../services/AuthService.js';
// import { Router } from '@angular/router';
// @Component({
//   selector: 'app-chat',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './chat.html',
//   styleUrls: ['./chat.css']
// })
// export class Chat {
//   username = '';
//   toUser = '';
//   message = '';
//   registered = false;
//   onlineUsers: string[] = [];
//   messages: {from: string, message: string, to:string}[] = [];

//   constructor(private chatService: ChatService,private router: Router,private authservice:AuthService) {
//     this.chatService.onlineUsers$.subscribe(users => this.onlineUsers = users);
//     this.chatService.messages$.subscribe(msgs => this.messages = msgs);
//     this.registered=this.router.getCurrentNavigation()?.extras.state?.['registered'];
//     this.username=this.chatService.getusername();
//   }

//   // register() {
//   //   if (!this.username) return;
//   //   this.chatService.register(this.username);
//   //   this.registered = true;
//   // }

//   send() {
//     if (!this.toUser || !this.message) return;
//     this.chatService.sendMessage(this.toUser, this.message);
//     this.message = '';
//   }


//   logout(){
//     this.chatService.logout();
//     alert("You are logged out !!");
//     this.router.navigate(['/login']);
//   }
// }

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.js';
import { CallService } from '../services/call.js';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/User.js';
@Component({
  selector: 'app-chat',
  standalone: true,
   imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})



export class Chat implements OnInit {
    public user:User= {
      uid:0,
      uname:"",
      email:"",
      phone:0,
      fname:"",
      lname:"",
      password:"",
      dob:null
  } ;
  public toUser :User={
     uid:0,
      uname:"",
      email:"",
      phone:0,
      fname:"",
      lname:"",
      password:"",
      dob:null
  } ;
  message = '';
public onlineUsers: User[] = [];
  messages: any[] = [];

  constructor(
    private chatService: ChatService,
    public callService: CallService,
     private router: Router
  ) {
   
  }

  async ngOnInit() {
    this.user = await this.chatService.getuser();
       console.log("Username is ",this.user.uname);
    // Subscribe to online users
this.chatService.onlineUsers$.subscribe(users => {
  // Ensure each element has the correct shape\
   this.user = this.chatService.getuser();
  this.onlineUsers = users;
});

    // Subscribe to messages
    this.chatService.messages$.subscribe(msgs => {
      this.messages = msgs;
    });

    // ✅ also connect call service
    await this.callService.startConnection(this.user.uname);
  }

  async send() {
    if (this.message.trim() && this.toUser) {
      await this.chatService.sendMessage(this.toUser, this.message);
      this.message = '';
    }
  }

  async callUser(user: User, event: Event) {
    console.log("CallUser called by ", user.uname);
    event.stopPropagation();
    this.toUser = user;
    await this.callService.startCall(user.uid.toString());  // not sure maybe it needs user.Uid
  }

  async endCall() {
    await this.callService.endCall();
  }

  async logout() {
    await this.chatService.logout();
    await this.callService.endCall();
    this.router.navigate(['/login']);
  }
}
// interface OnlineUser {
//   userid: string;
//   username: string;
// }