import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalNavbarService {
  constructor() {}
  private editingOrder$ = new BehaviorSubject<boolean>(false);
  private editingProduct$ = new BehaviorSubject<boolean>(false);
  private editingOrderSchedule$ = new BehaviorSubject<boolean>(false);
  private editingCost$ = new BehaviorSubject<boolean>(false);

  get editingOrder() {
    return this.editingOrder$.asObservable();
  }

  get editingProduct() {
    return this.editingProduct$.asObservable();
  }

  get editingOrderSchedule() {
    return this.editingOrderSchedule$.asObservable();
  }

  get editingCost() {
    return this.editingCost$.asObservable();
  }

  setEditingOrder(isEditing: boolean) {
    this.editingOrder$.next(isEditing);
  }

  setEditingProduct(isEditing: boolean) {
    this.editingProduct$.next(isEditing);
  }

  setEditingOrderSchedule(isEditing: boolean) {
    this.editingOrderSchedule$.next(isEditing);
  }

  setEditingCost(isEditing: boolean) {
    this.editingCost$.next(isEditing);
  }

  clearAllEditing() {
    this.editingOrder$.next(false);
    this.editingProduct$.next(false);
    this.editingOrderSchedule$.next(false);
    this.editingCost$.next(false);
  }

  get isAnyModalOpen() {
    return this.editingOrder$.asObservable().pipe(
      combineLatestWith(
        this.editingProduct$,
        this.editingOrderSchedule$,
        this.editingCost$
      ),
      map(([order, product, schedule, statistics]) => {
        const isOpen = order || product || schedule || statistics;
        return isOpen;
      })
    );
  }
}
