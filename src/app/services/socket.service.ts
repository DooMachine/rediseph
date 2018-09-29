import { Injectable } from '@angular/core';
import * as socketio from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

// Low level socket service
@Injectable({
    providedIn: 'root'
})
export class SocketService {

  private socket: SocketIOClient.Socket;
  connected$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.socket = socketio(environment.socket.baseUrl, environment.socket.config);
    this.socket.on('connect', () => this.connected$.next(true));
    this.socket.on('disconnect', () => this.connected$.next(false));
  }

  // join(room: string) {
  //   this.connected$.subscribe(connected => {
  //     if (connected) {
  //       this.socket.emit('join', {room});
  //     }
  //   });
  // }

  disconnect() {
    this.socket.disconnect();
    this.connected$.next(false);
  }

  emit(event: string, data?: any) {
    if (!environment.production) {
      console.group();
        console.log('----- SOCKET OUTGOING -----');
        console.log('Action: ', event);
        console.log('Payload: ', data);
      console.groupEnd();
    }
    this.socket.emit(event, data);
  }

  listen(event: string): Observable<any> {
    return new Observable( observer => {

      this.socket.on(event, data => {
        if (!environment.production) {
          console.group();
            console.log('----- SOCKET INBOUND -----');
            console.log('Action: ', event);
            console.log('Payload: ', data);
          console.groupEnd();
        }
        observer.next(data);
      });
      return () => this.socket.off(event);
    });
  }
}
