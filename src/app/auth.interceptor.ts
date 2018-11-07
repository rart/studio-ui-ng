import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError, filter, onErrorResumeNext, switchMap, take, takeUntil } from 'rxjs/operators';
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
    const
      { store, cookieService } = this,
      token = cookieService.get(HEADER);
    return next.handle(
      token
        ? request.clone({ headers: request.headers.set(environment.auth.header, token) })
        : request
    ).pipe(
      catchError((error, caught) => {
        if ((error instanceof HttpErrorResponse) && (error.status === 401)) {

          store.dispatch(timeout());

          const source$ = store.select('auth');

          // TODO url value should come from some API configuration file
          if ((request.url).includes('security/validate')) {
            throw (error);
          }

          return source$
            .pipe(
              filter(auth => auth === 'validated'),
              take(1),
              switchMap(() => caught),
              takeUntil(source$.pipe(filter(a => a === 'void')))
            );

        }
        throw (error);
      })
    );
  }

}
