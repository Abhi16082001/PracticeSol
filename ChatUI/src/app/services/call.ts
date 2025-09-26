import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class CallService {
  private hubConnection!: signalR.HubConnection;
  private username = '';
  public targetUser = '';
  private peerConnection!: RTCPeerConnection;
  private localStream!: MediaStream;

  public inCall = false;
  public incomingCallFrom: string | null = null;
  public showIncomingCallUI = false;
  private pendingOffer: any;
private remoteStream!: MediaStream;
  constructor() {}

  // Connect to the hub and register
  async startConnection(username: string) {
    this.username = username;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7084/callHub', {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.registerHandlers();

    await this.hubConnection.start();
    await this.hubConnection.invoke('RegisterUser', username);
  }

  private registerHandlers() {
    // Incoming call
    this.hubConnection.on('CallOffer', async (fromUser: string, offer: any) => {
      console.log("recieved a call offer from ", fromUser);
      this.targetUser = fromUser;
      this.incomingCallFrom = fromUser;
      this.showIncomingCallUI = true;
      console.log(`showincomingui is set to ${this.showIncomingCallUI} for call from ${fromUser} `);
      // Store the offer for when user clicks Accept
      this.pendingOffer = offer;
    });

    // Answer received by caller
    this.hubConnection.on('CallAnswer', async (answer: any) => {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      this.inCall=true;
      console.log("call is answered by target " );
       this.attachRemoteMedia();
    });

    // ICE candidates
    this.hubConnection.on('IceCandidate', async (candidate: any) => {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Call ended
    this.hubConnection.on('CallEnded', () => this.endCall());
  }

  // Caller initiates a call
  public async startCall(toUser: string) {
    console.log("Startcall is called for ", toUser);
    this.targetUser = toUser;
    await this.createPeerConnection();
console.log("peer connection is created ", toUser);
    try {
  const offer = await this.peerConnection.createOffer();
  console.log("Offer is generated ", toUser);
  await this.peerConnection.setLocalDescription(offer);
  console.log("call offer is being sent to ", toUser);
  await this.hubConnection.invoke('SendCallOffer', toUser, offer);
  
} catch (err) {
  console.error("Error during startCall:", err);
}
  }

  // Accept incoming call
  public async acceptCall() {
    if (!this.pendingOffer) return;

    this.inCall = true;
    this.showIncomingCallUI = false;

    await this.createPeerConnection();

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.pendingOffer));

 

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    await this.hubConnection.invoke('SendCallAnswer', this.targetUser, answer);
    
    this.pendingOffer = null;
    console.log("call is answered and sent to ", this.targetUser);
  }

  // Reject incoming call
  public rejectCall() {
    this.showIncomingCallUI = false;
    this.pendingOffer = null;
    this.targetUser = '';
  }

  // End ongoing call
  public async endCall() {
    this.inCall = false;
    this.peerConnection?.close();
    this.peerConnection = null!;
    this.localStream?.getTracks().forEach(t => t.stop());
    if (this.targetUser) {
      await this.hubConnection.invoke('EndCall', this.targetUser);
    }
    this.targetUser = '';
  }

  // Create peer connection with audio/video fallback
  private async createPeerConnection() {
    this.peerConnection = new RTCPeerConnection();



    try {
      // Try to get camera + mic
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      console.warn('No camera found, falling back to audio only', err);
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    }
console.log("Local tracks being added:", this.localStream.getTracks());
    this.localStream.getTracks().forEach(track => {
        console.log("Adding local track:", track.kind);
      this.peerConnection.addTrack(track, this.localStream)});

    // Attach local preview only if video track exists
    const localVideo = document.querySelector('#localVideo') as HTMLVideoElement;
    if (localVideo && this.localStream.getVideoTracks().length > 0) {
      localVideo.srcObject = this.localStream;
    }


// this.peerConnection.ontrack = (event) => {
//   const remoteVideo = document.querySelector('#remoteVideo') as HTMLVideoElement;
//   const remoteAudio = document.querySelector('#remoteAudio') as HTMLAudioElement;

//   // Attach video if video track exists
//   if (remoteVideo && event.streams[0].getVideoTracks().length > 0) {
//     remoteVideo.srcObject = event.streams[0];
//   }

//   // Attach audio if audio track exists
//   if (remoteAudio && event.streams[0].getAudioTracks().length > 0) {
//     remoteAudio.srcObject = event.streams[0];
//     remoteAudio.muted = false;   
//       remoteAudio.play().catch(err => console.warn('Audio play blocked:', err));   
//       console.log("Remote tracks received:", event.streams[0].getTracks());
//   } 
// };


// Called in createPeerConnection
this.peerConnection.ontrack = (event) => {
  // Keep a reference to the remote stream
  this.remoteStream = event.streams[0];
  console.log("Remote tracks received:", event.streams[0].getTracks());
  if (this.inCall) this.attachRemoteMedia();
  // Try to attach immediately if the element exists

};


    // Attach remote stream
//     this.peerConnection.ontrack = (event) => {
//       const remoteVideo = document.querySelector('#remoteVideo') as HTMLVideoElement;
//       if (remoteVideo) remoteVideo.srcObject = event.streams[0];
//     };
// this.peerConnection.ontrack = (event) => {
//   const remoteAudio = document.querySelector('#remoteAudio') as HTMLAudioElement;
//   remoteAudio.srcObject = event.streams[0];
// };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.hubConnection.invoke('SendIceCandidate', this.targetUser, event.candidate);
      }
    };
  }


// Utility method to attach remote media
private attachRemoteMedia() {
  const remoteVideo = document.querySelector('#remoteVideo') as HTMLVideoElement;
  const remoteAudio = document.querySelector('#remoteAudio') as HTMLAudioElement;

  if (this.remoteStream) {
    if (remoteVideo && this.remoteStream.getVideoTracks().length > 0) {
      remoteVideo.srcObject = this.remoteStream;
      remoteVideo.play().catch(err => console.warn('Video play blocked:', err));
    }

    if (remoteAudio && this.remoteStream.getAudioTracks().length > 0) {
      remoteAudio.srcObject = this.remoteStream;
      remoteAudio.muted = false;
      remoteAudio.play().catch(err => console.warn('Audio play blocked:', err));
    }
  }
}

}
