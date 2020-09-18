import { Injectable } from '@angular/core';
import { LoaderService } from '../Services/loader.service';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse }
  from '@angular/common/http';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {

  constructor(private loaderService: LoaderService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.loaderService.isLoading.next(true);
    return next.handle(req).pipe(finalize(() => this.loaderService.isLoading.next(false)));
  }
}