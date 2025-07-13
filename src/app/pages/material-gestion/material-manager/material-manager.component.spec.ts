import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MaterialManagerComponent} from './material-manager.component';

describe('MaterialManagerComponent', () => {
    let component: MaterialManagerComponent;
    let fixture: ComponentFixture<MaterialManagerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MaterialManagerComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(MaterialManagerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
