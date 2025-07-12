import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributionDialogComponent } from './attribution-dialog.component';

describe('AttributionDialogComponent', () => {
  let component: AttributionDialogComponent;
  let fixture: ComponentFixture<AttributionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttributionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
