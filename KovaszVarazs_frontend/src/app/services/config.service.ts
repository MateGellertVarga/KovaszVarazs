import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor() {}

  apiUrl = '/api';
  // https://kovaszvarazs-backend-bhsorj.laravel.cloud

  // A Reverb app key publikus kulcs (a secret csak a backenden van), ugyanaz mint a mobil appban.
  reverb = {
    appKey: 'ntAiR5UJsMMvWop08FL2',
    host: 'ws-a2039bc3-b01c-4883-8bc6-8a9d62be8305-reverb.laravel.cloud',
    port: '443',
    scheme: 'https',
    cluster: 'mt1',
  };
}
