import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WizardConfirmationSummaryComponent } from './wizard-confirmation-summary.component';

describe('WizardConfirmationSummaryComponent', () => {
  let component: WizardConfirmationSummaryComponent;
  let fixture: ComponentFixture<WizardConfirmationSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [WizardConfirmationSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardConfirmationSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
