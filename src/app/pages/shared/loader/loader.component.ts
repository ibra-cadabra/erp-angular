// 📁 src/app/shared/loader/loader.component.ts
import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {LoaderService} from "../../../services/loader.service";

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule],
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
    loader = inject(LoaderService);
}
