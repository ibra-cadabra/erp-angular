// src/app/components/edit-tools/edit-tools.component.ts
import { Component, effect, OnInit, Signal, ViewChild } from '@angular/core';
import { ToolService } from '../../services/tool.service';
import { Tool } from '../../models/tool.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-edit-tools',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  standalone: true,
  templateUrl: './tools.component.html',
})
export class ToolsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectedTool: Tool | null = null;
  form: FormGroup;

  readonly tools: Signal<Tool[]>;
  displayedColumns: string[] = ['name', 'emoji', 'description', 'category'];
  dataSource = new MatTableDataSource<Tool>([]);

  constructor(
    private toolService: ToolService,
    private fb: FormBuilder
  ){
    this.tools = this.toolService.tools;
    this.form = this.fb.group({
      name: [''],
      emoji: [''],
      description: [''],
      category: [''],
    });

    effect(() => {
      this.dataSource.data = this.tools();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage(); // revient à la première page si nécessaire
      }
    });
  }

  ngOnInit(): void {
    this.toolService.loadTools();

  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }
  selectTool(tool: Tool) {
    this.selectedTool = tool;
    this.form.patchValue(tool);
  }

  save() {
    if (!this.selectedTool) return;
    const updated = { ...this.selectedTool, ...this.form.value };

  }
}
