import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NotificationServiceService } from './notification-service.service';
import { SwUpdate, SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('title') title!: ElementRef<HTMLInputElement>;
  @ViewChild('message') message!: ElementRef<HTMLInputElement>;

  constructor(
    private notificationService: NotificationServiceService,
    private swPush: SwPush
  ) {}

  async ngOnInit() {
    this.notificationService.requestPermission();
  }

  sendNotification() {
    console.log('sending message');
    this.notificationService
      .sendMessage({
        title: this.title.nativeElement.value,
        description: this.message.nativeElement.value,
      })
      .subscribe({
        next: (response) => {
          console.log('message sent');
          console.log(response);
        },
        error: (error) => {
          console.error(error);
        },
      });
  }
}
