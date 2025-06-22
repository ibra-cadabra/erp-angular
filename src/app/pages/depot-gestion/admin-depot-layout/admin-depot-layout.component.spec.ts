import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDepotLayoutComponent } from './admin-depot-layout.component';

describe('AdminDepotLayoutComponent', () => {
  let component: AdminDepotLayoutComponent;
  let fixture: ComponentFixture<AdminDepotLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDepotLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDepotLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
