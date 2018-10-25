import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { NgRedux } from '@angular-redux/store';
import { AppState } from './classes/app-state.interface';
import { timeout } from './actions/user.actions';
import { environment } from '../environments/environment';
import { CookieService } from 'ngx-cookie-service';

const HEADER = environment.auth.header;

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private store: NgRedux<AppState>,
    private cookieService: CookieService) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.cookieService.get(HEADER);
    return next.handle(
      token
        ? request.clone({ headers: request.headers.set(environment.auth.header, token) })
        : request
    ).pipe(
      catchError((error, caught) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {

            this.store.dispatch(timeout());

            // TODO url value should come from some API configuration file
            // if ((request.url).includes('security/validate')) {
            //   return of('Session timed out.');
            // }

            return this.store.select('auth')
              .pipe(
                filter(auth => auth === 'validated'),
                take(1),
                switchMap(() => caught)
              );

          }
        }
        throw (error);
      })
    );
  }

}
