import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AdminPageHeaderComponent } from '../admin-page-header/admin-page-header.component';
import { AdminSeedModalComponent } from '../admin-seed-modal/admin-seed-modal.component';
import { DataService } from '../../../services/data.service';
import { ConfirmService } from '../../../services/confirm.service';
import {
  OrderSeedModel,
  SEED_DAYS,
} from '../../../../models/orderSeedModel';

@Component({
  selector: 'app-admin-seeds-page',
  imports: [NavbarComponent, AdminPageHeaderComponent, AdminSeedModalComponent],
  templateUrl: './admin-seeds-page.component.html',
})
export class AdminSeedsPageComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private confirmService: ConfirmService,
  ) {}

  isLoading: boolean = true;
  seeds: OrderSeedModel[] = [];
  editingSeed: OrderSeedModel | null = null;

  ngOnInit() {
    this.loadSeeds();
  }

  loadSeeds(silent = false) {
    if (!silent) this.isLoading = true;
    this.dataService.getSeeds().subscribe({
      next: (data) => {
        this.seeds = data.sort((a, b) => Number(a.day) - Number(b.day));
        this.seeds.forEach((s) =>
          s.orders.sort((a, b) =>
            (a.customer_name ?? '').localeCompare(b.customer_name ?? ''),
          ),
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Nem sikerült lekérni az alap rendeléseket:', err);
        this.isLoading = false;
      },
    });
  }

  dayName(day: number): string {
    return SEED_DAYS.find((d) => d.value === Number(day))?.label ?? '';
  }

  newSeed() {
    this.editingSeed = {
      id: 0,
      day: 0,
      orders: [],
    };
  }

  // Mély másolat, hogy a „Mégse” ne hagyja a listában a félkész módosításokat.
  modifySeed(seed: OrderSeedModel) {
    this.editingSeed = JSON.parse(JSON.stringify(seed));
  }

  // A mentett állapotot (új azonosítókkal együtt) a backendtől kérjük vissza.
  saveSeed() {
    this.editingSeed = null;
    this.loadSeeds(true);
  }

  async deleteSeed(seed: OrderSeedModel) {
    const confirmed = await this.confirmService.ask({
      title: 'Törlés',
      message: 'Biztosan törölni szeretnéd ezt az alap rendelést?',
      confirmLabel: 'Törlés',
    });
    if (!confirmed) return;

    this.dataService.deleteSeed(seed.id).subscribe({
      next: () => {
        this.seeds = this.seeds.filter((s) => s.id !== seed.id);
      },
      error: (error) => {
        console.error('Hiba az alap rendelés törlésekor:', error);
      },
    });
  }
}
