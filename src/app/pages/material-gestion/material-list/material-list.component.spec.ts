import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialListComponent } from './material-list.component';

describe('WorkMaterialListComponent', () => {
  let component: MaterialListComponent;
  let fixture: ComponentFixture<MaterialListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
