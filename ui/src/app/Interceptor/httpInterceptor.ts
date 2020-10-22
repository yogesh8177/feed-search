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
    this.loaderService.isLoading.next(this.loaderService.isLoading.getValue().concat(req.url));
    return next.handle(req).pipe(finalize(() => {
      let currentValues = this.loaderService.isLoading.getValue();
      let indexToRemove = currentValues.indexOf(req.url);
      currentValues.splice(indexToRemove, 1);
      this.loaderService.isLoading.next(currentValues);
    }));
  }
}