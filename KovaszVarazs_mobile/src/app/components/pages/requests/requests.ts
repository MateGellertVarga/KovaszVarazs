import { ChangeDetectorRef, Component } from '@angular/core';
import {
  IonHeader,
  IonButtons,
  IonToolbar,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonCardHeader,
  IonCardTitle,
  IonCard,
  IonItem,
  IonList,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { RequestModel } from 'src/models/requestModel';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.html',
  imports: [
    IonCardContent,
    IonList,
    IonItem,
    IonCard,
    IonCardTitle,
    IonCardHeader,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    IonIcon,
    IonButton,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonHeader,
    IonMenuButton,
    IonCardSubtitle,
  ],
})
export class Requests {
  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  isLoading = true;
  requests: RequestModel[] = [];
  editingRequest: RequestModel | null = null;

  ionViewWillEnter() {
    this.isLoading = true;
    this.dataService.getRequests().subscribe({
      next: (result: RequestModel[]) => {
        this.requests = result;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }

  refresh(event: any) {
    this.ionViewWillEnter();
    event.target.complete();
  }

  submitRequest(request: RequestModel, accepted: boolean) {
    console.log('Submitting request', request, accepted);
    this.editingRequest = null;
  }
}
