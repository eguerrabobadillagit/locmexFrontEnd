import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModalSearchableGridComponent } from './modal-searchable-grid.component';

describe('ModalSearchableGridComponent', () => {
  let component: ModalSearchableGridComponent;
  let fixture: ComponentFixture<ModalSearchableGridComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalSearchableGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalSearchableGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
