import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

// Közös keret az admin modalokhoz: cím, görgethető tartalom, hibaüzenet, Mégse / Mentés.
// Enterre (mint a mobil app <form>-jainál) a Mentés fut le.
@Component({
  selector: 'app-admin-modal',
  imports: [FormsModule],
  templateUrl: './admin-modal.component.html',
})
export class AdminModalComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() size: 'md' | 'lg' = 'md';
  @Input() isLoading = false;
  @Input() isSaving = false;
  @Input() errorMessage = '';
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  ngOnInit() {
    document.body.classList.add('overflow-hidden');
  }

  ngOnDestroy() {
    document.body.classList.remove('overflow-hidden');
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.cancel();
  }

  cancel() {
    if (!this.isSaving) this.canceled.emit();
  }

  save() {
    if (!this.isSaving && !this.isLoading) this.saved.emit();
  }
}
