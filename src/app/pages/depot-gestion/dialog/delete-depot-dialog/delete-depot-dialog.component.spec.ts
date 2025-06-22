import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDepotDialogComponent } from './delete-depot-dialog.component';

describe('DeleteDepotDialogComponent', () => {
  let component: DeleteDepotDialogComponent;
  let fixture: ComponentFixture<DeleteDepotDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteDepotDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteDepotDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
