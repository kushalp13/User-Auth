import { Injectable } from '@angular/core';
import { User } from './user';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  endpoint: string = 'http://localhost:4000/api'; 
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  currentUser = {}; //var

  constructor(
    private http: HttpClient,
    public router: Router
  ) {
  }

  signUp(user: User): Observable<any> {
  // Sign-up
    var formData: any = new FormData();
    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append("age", user.age);
    formData.append("gender", user.gender);
    formData.append("password", user.password);
    formData.append("avatar", user.avatar);

    let api = `${this.endpoint}/register-user`;
    return this.http.post(api, formData)
      .pipe(
        catchError(this.handleError)
      )
  }

  // Sign-in
  signIn(user: User) {
    return this.http.post<any>(`${this.endpoint}/signin`, user)
      .subscribe((res: any) => {
        localStorage.setItem('access_token', res.token)
        this.getUserProfile(res.msg._id).subscribe((res) => {
          this.currentUser = res;
          this.router.navigate(['user-profile/' + res.msg._id]);
        })
      })
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  get isLoggedIn(): boolean {
    let authToken = localStorage.getItem('access_token');
    return (authToken !== null) ? true : false;
  }

  doLogout() {
    let removeToken = localStorage.removeItem('access_token');
    if (removeToken == null) {
      this.router.navigate(['log-in']);
    }
  }

  // User profile
  getUserProfile(id): Observable<any> {
    let api = `${this.endpoint}/user-profile/${id}`;
    return this.http.get(api, { headers: this.headers }).pipe(
      map((res: Response) => {
        return res || {}
      }),
      catchError(this.handleError)
    )
  }

  //forgot password link request
  sendForgotMail(user: User) {
    return this.http.post<any>(`${this.endpoint}/forgot-password`, user)
    .subscribe((res: any) => {
      console.log(res);
    });
  }

  //reset password through token 
  resetPassword(resetData: any) {
    return this.http.post<any>(`${this.endpoint}/reset-password`, resetData)
    .subscribe((res: any)=> {
      console.log(res);
    })
  }
  // Error 
  handleError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      msg = error.error.message;
    } else {
      // server-side error
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(msg);
  }
}