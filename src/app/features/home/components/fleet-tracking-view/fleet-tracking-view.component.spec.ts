import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetTrackingViewComponent } from './fleet-tracking-view.component';

describe('FleetTrackingViewComponent', () => {
  let component: FleetTrackingViewComponent;
  let fixture: ComponentFixture<FleetTrackingViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetTrackingViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetTrackingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
