import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor() {}

  apiUrl = 'https://kovaszvarazs-backend-bhsorj.laravel.cloud/api';
}
