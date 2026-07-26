import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  mailOutline,
  callOutline,
} from 'ionicons/icons';

import { DataService } from 'src/app/services/data.service';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { RequestModel } from 'src/models/requestModel';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.html',
  standalone: true,
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
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner,
  ],
})
export class Requests {
  isLoading = true;
  allRequests: RequestModel[] = [];
  filteredRequests: RequestModel[] = [];
  editingRequest: RequestModel | null = null;

  currentSegment: 'pending' | 'approved' | 'rejected' = 'pending';

  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService,
    private changeDetectorRef: ChangeDetectorRef,
    private alertController: AlertController
  ) {
    addIcons({
      checkmarkCircleOutline,
      closeCircleOutline,
      mailOutline,
      callOutline,
    });
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData(event?: any) {
    this.isLoading = true;

    this.dataService.getRequests().subscribe({
      next: (result: RequestModel[]) => {
        this.allRequests = result;
        this.filterRequests();
        this.isLoading = false;
        if (event) event.target.complete();
      },
      error: (err: any) => {
        console.error('Kérelmek lekérése sikertelen:', err);
        this.isLoading = false;
        if (event) event.target.complete();
      },
    });
  }

  refresh(event: any) {
    this.loadData(event);
  }

  segmentChanged(event: any) {
    this.currentSegment = event.detail.value as
      | 'pending'
      | 'approved'
      | 'rejected';
    this.filterRequests();
  }

  filterRequests() {
    this.filteredRequests = this.allRequests.filter(
      (req) => req.status === this.currentSegment
    );
    this.changeDetectorRef.detectChanges();
  }

  async submitRequest(request: RequestModel, action: 'approve' | 'reject') {
    const actionText =
      action === 'approve' ? 'engedélyezni' : 'elutasítani/letiltani';
    const headerText = action === 'approve' ? 'Engedélyezés' : 'Művelet';

    const alert = await this.alertController.create({
      header: headerText,
      message: `Biztosan ${actionText} szeretnéd ${request.name} felhasználót?`,
      buttons: [
        {
          text: 'Mégse',
          role: 'cancel',
        },
        {
          text: 'Igen',
          role: 'confirm',
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      this.isLoading = true;
      this.dataService
        .handleRegistrationRequest(request.id!, action)
        .subscribe({
          next: () => {
            request.status = action === 'approve' ? 'approved' : 'rejected';
            this.filterRequests();
            this.isLoading = false;
          },
          error: (err: any) => {
            console.error('Művelet sikertelen:', err);
            this.isLoading = false;
          },
        });
    }
  }
}
