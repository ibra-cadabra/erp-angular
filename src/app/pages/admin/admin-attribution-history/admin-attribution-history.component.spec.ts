import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAttributionHistoryComponent } from './admin-attribution-history.component';

describe('AdminAttributionHistoryComponent', () => {
  let component: AdminAttributionHistoryComponent;
  let fixture: ComponentFixture<AdminAttributionHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAttributionHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAttributionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
