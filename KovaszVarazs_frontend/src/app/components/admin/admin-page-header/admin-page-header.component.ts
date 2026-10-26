import { Component, EventEmitter, Input, Output } from '@angular/core';

// Az admin oldalak fejléce: cím, (opcionális) extra vezérlők, frissítés és „Új …” gomb.
// A frissítés gomb a mobil app „húzd le a frissítéshez” funkcióját váltja ki.
@Component({
  selector: 'app-admin-page-header',
  templateUrl: './admin-page-header.component.html',
})
export class AdminPageHeaderComponent {
  @Input() title = '';
  @Input() addLabel = '';
  @Input() showRefresh = true;
  @Output() add = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
}
