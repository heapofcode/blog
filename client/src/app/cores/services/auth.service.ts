import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { Storage } from '@capacitor/storage';
import { environment } from 'src/environments/environment';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private roles:BehaviorSubject<any> = new BehaviorSubject<any>(null);
  roles$:Observable<any> = this.roles.asObservable();

  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null)

  currentAccessToken = null;
  url = `${environment.api_url}/account`;

  constructor(
    private http: HttpClient
    )
    {
      this.loadToken();
    }

  async loadToken() {
    const token = await Storage.get({ key: ACCESS_TOKEN_KEY });
    if (token && token.value) {
      this.currentAccessToken = token.value;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  login(credentials: {username, password}): Observable<any> {
    return this.http.post(`${this.url}/login`, credentials).pipe(
      switchMap((tokens: {accessToken, refreshToken, roles }) => {
        this.roles.next(tokens.roles);
        this.currentAccessToken = tokens.accessToken;
        return this.storeToken(tokens);
      }),
      tap(_ => {
        this.isAuthenticated.next(true);
      })
    )
  }

  logout() {
    return this.http.post(`${this.url}/logout`, {}).pipe(
      switchMap(_ => {
        this.currentAccessToken = null;
        return this.removeToken();
      }),
      tap(_ => {
        this.isAuthenticated.next(false);
      })
    )
  }

  getNewAccessToken() {
    const refreshToken = from(Storage.get({ key: REFRESH_TOKEN_KEY }));
    return refreshToken.pipe(
      switchMap(token => {
        if (token && token.value) {
          const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `${token.value}`
            })
          }
          return this.http.get(`${this.url}/refresh`, httpOptions);
        } else {
          return of(null);
        }
      })
    );
  }

  storeToken(tokens:{ accessToken, refreshToken}){
    const storeAccess = Storage.set({key: ACCESS_TOKEN_KEY, value: tokens.accessToken});
    const storeRefresh = Storage.set({key: REFRESH_TOKEN_KEY, value: tokens.refreshToken});
    return from(Promise.all([storeAccess, storeRefresh]));
  }

  removeToken(){
    const deleteAccess = Storage.remove({ key: ACCESS_TOKEN_KEY });
    const deleteRefresh = Storage.remove({ key: REFRESH_TOKEN_KEY });
    this.isAuthenticated.next(false);
    return from(Promise.all([deleteAccess, deleteRefresh]));
  }

  storeAccessToken(token) {
    this.currentAccessToken = token.accessToken;
    Storage.set({ key: REFRESH_TOKEN_KEY, value: token.refreshToken });
    return from(Storage.set({ key: ACCESS_TOKEN_KEY, value: token.accessToken }));
  }

}
