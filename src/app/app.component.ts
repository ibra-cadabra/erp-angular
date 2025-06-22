import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MaterialModule } from './modules/material.module';
import { AuthService } from './services/auth.service';
import { DepotService } from './services/depot.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterModule,
    MaterialModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'erp-stock';
  constructor(private authService: AuthService,
    private depotService: DepotService) {
  }

  ngOnInit() {
    // 🔐 Charger l'utilisateur connecté à partir du token (s'il existe)
    const token = this.authService.token();
    if (token) {
      this.authService.decodeToken(token); // remplit le signal `user`
    }

    // 🏢 Charger les dépôts au démarrage (souvent utilisés dans admin-depot, gestion utilisateurs, etc.)
    this.depotService.fetchDepots();
  }
  
}
