import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MaterialService } from '../../../services/material.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../modules/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Material } from '../../../models/material';

@Component({
  selector: 'app-work-material-list',
  standalone: true,
  imports: [
    MaterialModule,
    RouterLink,
    MatPaginator,
    MatSort,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './material-list.component.html',
  styleUrls: ['./material-list.component.css']
})

export class MaterialListComponent implements OnInit {

  displayedColumns: string[] = ['name', 'serialNumber', 'category', 'condition', 'assignedTo', 'actions'];
  dataSource = new MatTableDataSource<Material>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm: FormGroup;
  materials: Material[] = [];
  filteredMaterials: Material[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private materialService: MaterialService) {


      this.filterForm = this.fb.group({
        name: [''],
        category: [''],
        condition: ['']
      });
  }

  ngOnInit(): void {
    this.materialService.getAllMaterials();
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const { name, category, state } = this.filterForm.value;
    this.filteredMaterials = this.materials.filter(material => {
      return (!name || material.name.toLowerCase().includes(name.toLowerCase())) &&
             (!category || material.category === category) &&
             (!state || material.state === state);
    });
    this.dataSource.data = this.filteredMaterials;
  }

  editMaterial(material: Material) {
    this.router.navigate(['/materials/edit', material.idMat]);
  }

  confirmDelete(id: number) {
    if (confirm('Supprimer ce matériel ?')) {
      this.materialService.delete(id);
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
