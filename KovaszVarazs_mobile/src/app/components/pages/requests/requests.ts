import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  IonToggle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  mailOutline,
  callOutline,
} from 'ionicons/icons';

import { DataService } from 'src/app/services/data.service';
import { RequestModel } from 'src/models/requestModel';
import { UserModel } from 'src/models/userModel';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.html',
  standalone: true,
  imports: [
    IonToggle,
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
    FormsModule,
  ],
})
export class Requests {
  isLoading = true;

  // Adatok szétválasztva modell szerint
  pendingRequests: RequestModel[] = [];
  rejectedRequests: RequestModel[] = [];
  approvedUsers: UserModel[] = [];

  // Ezt jeleníti meg a felület a fül alapján
  displayedItems: any[] = [];

  currentSegment: 'pending' | 'approved' | 'rejected' = 'pending';

  constructor(
    private dataService: DataService,
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
    this.loadDataForCurrentSegment();
  }

  loadDataForCurrentSegment(event?: any) {
    this.isLoading = true;

    if (this.currentSegment === 'approved') {
      this.dataService.getUsers().subscribe({
        next: (users: UserModel[]) => {
          this.approvedUsers = users.filter((u) => u.is_active);
          this.displayedItems = this.approvedUsers;
          this.isLoading = false;
          if (event) event.target.complete();
        },
        error: (err: any) => {
          console.error('Hiba a userek lekérésekor:', err);
          this.isLoading = false;
          if (event) event.target.complete();
        },
      });
    } else {
      this.dataService.getRequests().subscribe({
        next: (result: RequestModel[]) => {
          if (this.currentSegment === 'pending') {
            this.pendingRequests = result.filter(
              (req) => req.status === 'pending'
            );
            this.displayedItems = this.pendingRequests;
          } else {
            this.rejectedRequests = result.filter(
              (req) => req.status === 'rejected'
            );
            this.displayedItems = this.rejectedRequests;
          }
          this.isLoading = false;
          if (event) event.target.complete();
        },
        error: (err: any) => {
          console.error('Hiba a kérelmek lekérésekor:', err);
          this.isLoading = false;
          if (event) event.target.complete();
        },
      });
    }
  }

  refresh(event: any) {
    this.loadDataForCurrentSegment(event);
  }

  segmentChanged(event: any) {
    this.currentSegment = event.detail.value as
      | 'pending'
      | 'approved'
      | 'rejected';
    this.loadDataForCurrentSegment();
  }

  async submitRequest(request: RequestModel, action: 'approve' | 'reject') {
    const actionText = action === 'approve' ? 'engedélyezni' : 'elutasítani';
    const headerText = action === 'approve' ? 'Engedélyezés' : 'Elutasítás';

    const alert = await this.alertController.create({
      header: headerText,
      message: `Biztosan ${actionText} szeretnéd ${request.name} kérelmét?`,
      buttons: [
        { text: 'Mégse', role: 'cancel' },
        { text: 'Igen', role: 'confirm' },
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
            this.loadDataForCurrentSegment();
          },
          error: (err: any) => {
            console.error('Művelet sikertelen:', err);
            this.isLoading = false;
          },
        });
    }
  }

  async deactivateUser(user: UserModel) {
    const alert = await this.alertController.create({
      header: 'Letiltás',
      message: `Biztosan letiltod ${user.name} felhasználót?`,
      buttons: [
        { text: 'Mégse', role: 'cancel' },
        { text: 'Igen', role: 'confirm' },
      ],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();

    if (role === 'confirm') {
      this.isLoading = true;
      this.dataService.deactivateUser(user.id!).subscribe({
        next: () => {
          this.loadDataForCurrentSegment();
        },
        error: (err: any) => {
          console.error('Letiltás sikertelen:', err);
          this.isLoading = false;
        },
      });
    }
  }

  toggleReminder(user: UserModel) {
    this.dataService.toggleReminder(user.id!).subscribe({
      error: (err: any) => {
        user.wants_reminder = !user.wants_reminder;
        console.error('Nem sikerült módosítani az emlékeztetőt', err);
      },
    });
  }
}
