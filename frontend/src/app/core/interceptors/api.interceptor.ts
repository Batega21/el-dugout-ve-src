import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  let headers = req.headers;
  if (token && !headers.has('Authorization')) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  // Only prefix if URL does not start with http/https
  let url = req.url;
  if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) {
    const baseUrl = environment.apiUrl.replace(/\/$/, '');
    const cleanPath = req.url.replace(/^\//, '');
    url = `${baseUrl}/${cleanPath}`;
  }

  const apiReq = req.clone({ url, headers });
  return next(apiReq);
};

