import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor() {}

  apiUrl = '/api';
  // https://kovaszvarazs-backend-bhsorj.laravel.cloud
}
