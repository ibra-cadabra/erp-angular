import {Component} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {AuthService} from './services/auth.service';
import {MaterialModule} from "./modules/material.module";
import {RouterModule, RouterOutlet} from "@angular/router";
import {CommonModule} from "@angular/common";
import {DepotService} from "./services/depot.service";
import {UserService} from "./services/user.service";
import {LoaderComponent} from "./pages/shared/loader/loader.component";

@Component({
    selector: 'app-root',
    imports: [MaterialModule, RouterOutlet, RouterModule, CommonModule, LoaderComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    drawerMode: 'side' | 'over' = 'side';
    drawerOpened = true;

    constructor(
        public authService: AuthService,
        private depotService: DepotService,
        private userService: UserService,
        private observer: BreakpointObserver) {
        this.depotService.fetchDepots();
        this.userService.loadUsers();
    }

    title(title: any) {
        throw new Error('Method not implemented.');
    }

    ngOnInit() {
        this.observer.observe([Breakpoints.Handset, Breakpoints.Tablet])
            .subscribe(({matches}) => {
                this.drawerMode = matches ? 'over' : 'side';
                this.drawerOpened = !matches;
                console.log('📱 Format détecté :', matches ? 'Mobile/Tablette' : 'Desktop');
            });
    }

    isLogged(): boolean {
        return this.authService.isLogged();
    }

    logout() {
        this.authService.logout();
    }

    userRole(): string | null {
        return this.authService.getCurrentUser()?.role ?? null;
    }
}
