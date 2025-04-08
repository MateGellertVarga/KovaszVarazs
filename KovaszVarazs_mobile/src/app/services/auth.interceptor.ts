import {
  HttpEvent,
  HttpHandler,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  var authService = inject(AuthService);

  const token = authService.loggedInUser!.token;

  if (token != null && token != '' && token != undefined) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  } else {
    console.log(`Error: token ${token}`);
  }

  return next(req);
};
