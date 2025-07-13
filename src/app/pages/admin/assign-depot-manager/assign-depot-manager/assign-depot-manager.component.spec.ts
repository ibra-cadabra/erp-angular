import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AssignDepotManagerComponent} from './assign-depot-manager.component';

describe('AssignDepotManagerComponent', () => {
    let component: AssignDepotManagerComponent;
    let fixture: ComponentFixture<AssignDepotManagerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AssignDepotManagerComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AssignDepotManagerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
