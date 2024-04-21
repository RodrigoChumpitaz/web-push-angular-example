import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationServiceService {
  private url: string = 'http://localhost:3500/api/v1/notification';
  private _swRegistration!: ServiceWorkerRegistration;
  private _isSubscribed!: boolean;
  private public_vapid_key =
    'BMu0ckbspQic9O1arWr_wv80gMzLHucZRTTwCCcGmygAqRTBqDAT0ItBiKaGgo39C4pQU1Gkrk5YDWlW1bpCD2s';

  constructor(private readonly http: HttpClient) {}

  public requestPermission() {
    if (this.checkServiceWorkerPushEnabled()) {
      this.enableServiceWorker();
    } else {
      console.warn(
        'Las notificaciones web no están soportadas por el navegador'
      );
    }
  }
  private checkServiceWorkerPushEnabled(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  private enableServiceWorker(): void {
    navigator.serviceWorker
      .register('app/serviceWorker/sw.js', { scope: '/app/serviceWorker/' })
      .then((swReg) => {
        // console.log('Service Worker esta registrado', swReg);
        this._swRegistration = swReg;
        this.initialiseUI();
      })
      .catch(function (error) {
        console.error('Error Service Worker', error);
      });
  }

  private initialiseUI(): void {
    this._swRegistration.pushManager.getSubscription().then((subscription) => {
      this._isSubscribed = !(subscription === null);

      if (this._isSubscribed) {
        this.sendSubcriptionObject(subscription);
      } else {
        console.log('Usuario NO esta registrado');
        this.subscribeUser();
      }
    });
  }

  private sendSubcriptionObject(subscription: any): void {
    const apiUrl = `${this.url}/subscription`;
    this.http.post(apiUrl, subscription).subscribe();
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private subscribeUser(): void {
    const applicationServerKey = this.urlB64ToUint8Array(this.public_vapid_key);
    this._swRegistration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      })
      .then((subscription) => {
        // console.log('Usuario suscritó: ', subscription);
        this.sendSubcriptionObject(subscription);
        this._isSubscribed = true;
      })
      .catch(function (err) {
        console.log('Fallo al realizar la subcripción: ', err);
      });
  }

  // public subscribe(data: any): Observable<any> {
  //   return this.http.post(`${this.url}/subscription`, data);
  // }

  public sendMessage(data: any): Observable<any> {
    return this.http.post(`${this.url}/send-message`, data);
  }
}
