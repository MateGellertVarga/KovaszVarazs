import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor() {}

  apiUrl = 'https://kovaszvarazs-backend-bhsorj.laravel.cloud/api';
  //apiUrl = 'http://127.0.0.1:8000/api';
}
