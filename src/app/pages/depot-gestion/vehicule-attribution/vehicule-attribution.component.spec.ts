import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeAttributionComponent } from './vehicule-attribution.component';

describe('VehiculeAttributionComponent', () => {
  let component: VehiculeAttributionComponent;
  let fixture: ComponentFixture<VehiculeAttributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeAttributionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeAttributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
