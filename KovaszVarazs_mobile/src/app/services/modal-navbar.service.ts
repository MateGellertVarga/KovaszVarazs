import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalNavbarService {
  constructor() {}
  private editingModal$ = new BehaviorSubject<boolean>(false);

  openModal() {
    this.editingModal$.next(true);
  }

  closeModal() {
    this.editingModal$.next(false);
  }

  get isModalOpen() {
    return this.editingModal$.asObservable();
  }
}
