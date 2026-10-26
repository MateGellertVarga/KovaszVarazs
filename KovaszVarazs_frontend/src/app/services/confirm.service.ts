import { Injectable } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

// A mobil app AlertController-ének webes megfelelője: `if (await confirm.ask(...)) {...}`.
// A dialógust az AppComponent-ben lévő <app-confirm-dialog> rajzolja ki.
@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  request: ConfirmRequest | null = null;

  ask(options: ConfirmOptions): Promise<boolean> {
    this.request?.resolve(false);
    return new Promise((resolve) => {
      this.request = { ...options, resolve };
    });
  }

  close(confirmed: boolean) {
    const request = this.request;
    this.request = null;
    request?.resolve(confirmed);
  }
}
