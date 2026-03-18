import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TelemetryFieldsSelectorComponent } from './telemetry-fields-selector.component';

describe('TelemetryFieldsSelectorComponent', () => {
  let component: TelemetryFieldsSelectorComponent;
  let fixture: ComponentFixture<TelemetryFieldsSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TelemetryFieldsSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TelemetryFieldsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
