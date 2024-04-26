import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from "@angular/common/http"
import { Observable } from 'rxjs';

@Injectable()
export class CustomeInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(localStorage.getItem("authToken")) {
      const token = localStorage.getItem("authToken")

      const newCloneRequest = req.clone({
        setHeaders: {
          authorization: token!
        }
      })

      return next.handle(newCloneRequest);
    }

    return next.handle(req);
  }
}