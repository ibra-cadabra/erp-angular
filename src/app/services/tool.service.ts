// src/app/services/tool.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tool } from '../models/tool.model';
import { signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToolService {
  private apiUrl = 'http://localhost:3000/tools';

  private _tools = signal<Tool[]>([]);
  readonly tools = this._tools.asReadonly();


  constructor(private http: HttpClient) {
    this.loadTools();
    console.log('ToolService initialized');
  }

  loadTools() {
    this.http.get<Tool[]>(this.apiUrl).subscribe({
      next: data => {
        console.log('Outils récupérés :', data);
        this._tools.set(data);
      },
      error: err => console.error('Erreur lors du chargement des outils', err)
    });
  }

  updateTool(tool: Tool) {
    this.http.put<Tool>(`${this.apiUrl}/${tool._id}`, tool).subscribe({
      next: updated => {
        this._tools.update(tools =>
          tools.map(t => t._id === updated._id ? updated : t)
        );
        console.log('✅ Outil mis à jour :', updated);
      },
      error: err => console.error('Erreur update outil', err)
    });
  }
}
