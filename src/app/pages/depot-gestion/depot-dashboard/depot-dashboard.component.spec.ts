import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DepotDashboardComponent} from './depot-dashboard.component';

describe('DepotDashboardComponent', () => {
    let component: DepotDashboardComponent;
    let fixture: ComponentFixture<DepotDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DepotDashboardComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DepotDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
