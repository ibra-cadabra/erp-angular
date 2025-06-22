import { MatDialogRef } from '@angular/material/dialog';
// src/app/material.module.ts
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule} from '@angular/material/menu';
import { NgChartsModule } from 'ng2-charts';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
@NgModule({
  exports: [
    MatCardModule,
    MatRadioModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSortModule,
    MatMenuModule,
    MatOptionModule,
    MatSidenavModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTableModule,
    NgChartsModule
  ]
})
export class MaterialModule {}
