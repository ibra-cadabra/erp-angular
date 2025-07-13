// auth.guard.ts
import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';

/**
 * ✅ Vérifie si l'utilisateur est connecté
 */
export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.user()) {
        router.navigate(['/login']);
        return false;
    }

    return true;
};

/**
 * ✅ Vérifie si l'utilisateur connecté a un rôle autorisé
 */
export const authorizeRoles = (...allowedRoles: string[]): CanActivateFn => {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);

        const user = auth.getCurrentUser();

        if (!user) {
            router.navigate(['/login']);
            return false;
        }

        if (!allowedRoles.includes(user.role)) {
            router.navigate(['/unauthorized']);
            return false;
        }

        return true;
    };
};
