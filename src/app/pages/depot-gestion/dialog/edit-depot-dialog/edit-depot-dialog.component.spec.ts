import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDepotDialogComponent } from './edit-depot-dialog.component';

describe('EditDepotDialogComponent', () => {
  let component: EditDepotDialogComponent;
  let fixture: ComponentFixture<EditDepotDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDepotDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDepotDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
