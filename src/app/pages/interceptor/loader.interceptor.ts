// 📁 src/app/pages/interceptor/loader.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoaderService } from '../../services/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
    const loader = inject(LoaderService); // ✅ Injection ici (pas de constructor)
    loader.show();

    return next(req).pipe(
        finalize(() => loader.hide())
    );
};
