import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor() {}

  apiUrl = 'https://kovaszvarazs-backend-bhsorj.laravel.cloud/api';
  //apiUrl = 'http://localhost:8000/api';
  reverb = {
    appKey: environment.reverb?.appKey || '',
    host: environment.reverb?.host || '',
    port: environment.reverb?.port || '',
    scheme: environment.reverb?.scheme || '',
    cluster: environment.reverb?.cluster || 'mt1',
  };
}
