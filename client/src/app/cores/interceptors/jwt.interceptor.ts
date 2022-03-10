import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import {
  catchError,
  finalize,
  switchMap,
  filter,
  take,
} from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // Used for queued API calls while refreshing tokens
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  isRefreshingToken = false;

  constructor(private auth: AuthService, private toastCtrl: ToastController) { }

  // Intercept every HTTP call
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Check if we need additional token logic or not
    if (this.isInBlockedList(request.url)) {
      return next.handle(request);
    } else {
      return next.handle(this.addToken(request)).pipe(
        catchError(err => {
          if (err instanceof HttpErrorResponse) {
            switch (err.status) {
              case 400:
                return this.handle400Error(err);
              case 401:
                return this.handle401Error(request, next);
              case 500:
                return this.handle500Error(err);
              default:
                return throwError(err);
            }
          } else {
            return throwError(err);
          }
        })
      );
    }
  }

  private isInBlockedList(url: string): Boolean {
    if (url == `${environment.api_url}/account/login`
    // || url == `${environment.api_url}/account/refresh`
     ) {
      return true;
    } else {
      return false;
    }
  }

  // Add our current access token from the service if present
  private addToken(req: HttpRequest<any>) {
    if (this.auth.currentAccessToken) {
      return req.clone({
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.auth.currentAccessToken}`
        })
      });
    } else {
      return req;
    }
  }

  private async handle400Error(err) {
    this.auth.removeToken();
    return of(null);
  }

  private async handle500Error(err) {
    this.auth.removeToken();
    return of(null);
  }

  private handle401Error(request: HttpRequest < any >, next: HttpHandler): Observable < any > {
    if(!this.isRefreshingToken) {

      this.tokenSubject.next(null);
      this.isRefreshingToken = true;
      this.auth.currentAccessToken = null;

      return this.auth.getNewAccessToken().pipe(
        switchMap((token: any) => {
          if (token) {
            const accessToken = token.accessToken;
            return this.auth.storeAccessToken(token).pipe(
              switchMap(_ => {
                this.tokenSubject.next(accessToken);
                return next.handle(this.addToken(request));
              })
            );
          } else {
            return of(null);
          }
        }),
        finalize(() => {
          this.isRefreshingToken = false;
        })
      );
    } else {
      return this.tokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request));
        })
      );
    }
  }

}
