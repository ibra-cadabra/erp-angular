// auth.interceptor.ts
import {inject} from '@angular/core';
import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {AuthService} from '../../services/auth.service';
import {catchError, switchMap} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Router} from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const token = auth.token();
    const authReq = token
        ? req.clone({setHeaders: {Authorization: `Bearer ${token}`}})
        : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            const isUnauthorized = error.status === 401;

            if (isUnauthorized && auth.isLoggedIn()) {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    auth.logout();
                    router.navigate(['/login']);
                    return throwError(() => error);
                }

                return auth.refreshAccessToken().pipe(
                    switchMap(({accessToken}) => {
                        auth.decodeToken(accessToken);

                        const retryReq = req.clone({
                            setHeaders: {Authorization: `Bearer ${accessToken}`}
                        });

                        return next(retryReq);
                    }),
                    catchError(refreshErr => {
                        console.error('❌ Refresh token failed:', refreshErr);
                        auth.logout();
                        router.navigate(['/login']);
                        return throwError(() => refreshErr);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
