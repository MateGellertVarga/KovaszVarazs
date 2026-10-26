import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AdminPageHeaderComponent } from '../admin-page-header/admin-page-header.component';
import { DataService } from '../../../services/data.service';
import { ConfirmService } from '../../../services/confirm.service';
import { RequestModel } from '../../../../models/requestModel';
import { UserModel } from '../../../../models/userModel';

type UserSegment = 'pending' | 'approved' | 'rejected';

@Component({
  selector: 'app-admin-users-page',
  imports: [NavbarComponent, CommonModule, AdminPageHeaderComponent],
  templateUrl: './admin-users-page.component.html',
})
export class AdminUsersPageComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private confirmService: ConfirmService,
  ) {}

  segments: { value: UserSegment; label: string }[] = [
    { value: 'pending', label: 'Függő' },
    { value: 'approved', label: 'Elfogadva' },
    { value: 'rejected', label: 'Elutasítva' },
  ];

  isLoading = true;
  currentSegment: UserSegment = 'pending';
  requests: RequestModel[] = [];
  approvedUsers: UserModel[] = [];

  ngOnInit() {
    this.loadDataForCurrentSegment();
  }

  get displayedCount(): number {
    return this.currentSegment === 'approved'
      ? this.approvedUsers.length
      : this.requests.length;
  }

  loadDataForCurrentSegment() {
    this.isLoading = true;
    const segment = this.currentSegment;

    if (segment === 'approved') {
      this.dataService.getUsers().subscribe({
        next: (users: UserModel[]) => {
          if (segment !== this.currentSegment) return;
          this.approvedUsers = users
            .filter((u) => u.is_active)
            .sort((a, b) => a.name.localeCompare(b.name));
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Hiba a felhasználók lekérésekor:', err);
          this.isLoading = false;
        },
      });
    } else {
      this.dataService.getRequests().subscribe({
        next: (result: RequestModel[]) => {
          if (segment !== this.currentSegment) return;
          this.requests = result
            .filter((req) => req.status === segment)
            .sort((a, b) => a.name.localeCompare(b.name));
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Hiba a kérelmek lekérésekor:', err);
          this.isLoading = false;
        },
      });
    }
  }

  segmentChanged(segment: UserSegment) {
    if (segment === this.currentSegment) return;
    this.currentSegment = segment;
    this.loadDataForCurrentSegment();
  }

  async submitRequest(request: RequestModel, action: 'approve' | 'reject') {
    const isApprove = action === 'approve';
    const confirmed = await this.confirmService.ask({
      title: isApprove ? 'Engedélyezés' : 'Elutasítás',
      message: `Biztosan ${isApprove ? 'engedélyezni' : 'elutasítani'} szeretnéd ${request.name} kérelmét?`,
      confirmLabel: 'Igen',
      tone: isApprove ? 'primary' : 'danger',
    });
    if (!confirmed) return;

    this.isLoading = true;
    this.dataService.handleRegistrationRequest(request.id, action).subscribe({
      next: () => this.loadDataForCurrentSegment(),
      error: (err: any) => {
        console.error('Művelet sikertelen:', err);
        this.isLoading = false;
      },
    });
  }

  async deactivateUser(user: UserModel) {
    const confirmed = await this.confirmService.ask({
      title: 'Letiltás',
      message: `Biztosan letiltod ${user.name} felhasználót?`,
      confirmLabel: 'Igen',
    });
    if (!confirmed) return;

    this.isLoading = true;
    this.dataService.deactivateUser(user.id!).subscribe({
      next: () => this.loadDataForCurrentSegment(),
      error: (err: any) => {
        console.error('Letiltás sikertelen:', err);
        this.isLoading = false;
      },
    });
  }

  toggleReminder(user: UserModel) {
    user.wants_reminder = !user.wants_reminder;
    this.dataService.toggleReminder(user.id!).subscribe({
      error: (err: any) => {
        user.wants_reminder = !user.wants_reminder;
        console.error('Nem sikerült módosítani az emlékeztetőt', err);
      },
    });
  }
}
