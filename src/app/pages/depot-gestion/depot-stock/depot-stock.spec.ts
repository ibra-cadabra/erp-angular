import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotStock } from './depot-stock';

describe('DepotStock', () => {
  let component: DepotStock;
  let fixture: ComponentFixture<DepotStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotStock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepotStock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
