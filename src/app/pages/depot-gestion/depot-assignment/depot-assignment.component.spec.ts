import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DepotAssignmentComponent} from './depot-assignment.component';

describe('DepotAssignmentComponent', () => {
    let component: DepotAssignmentComponent;
    let fixture: ComponentFixture<DepotAssignmentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DepotAssignmentComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DepotAssignmentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
