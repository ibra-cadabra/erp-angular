import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DepotManagerComponent} from './depot-manager.component';


describe('DepotManagerComponent', () => {
    let component: DepotManagerComponent;
    let fixture: ComponentFixture<DepotManagerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DepotManagerComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DepotManagerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
