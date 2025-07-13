import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotTechnicians } from './depot-technicians';

describe('DepotTechnicians', () => {
  let component: DepotTechnicians;
  let fixture: ComponentFixture<DepotTechnicians>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotTechnicians]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepotTechnicians);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
