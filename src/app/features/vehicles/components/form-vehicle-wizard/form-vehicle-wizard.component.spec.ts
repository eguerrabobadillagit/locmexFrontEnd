import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormVehicleWizardComponent } from './form-vehicle-wizard.component';

describe('FormVehicleWizardComponent', () => {
  let component: FormVehicleWizardComponent;
  let fixture: ComponentFixture<FormVehicleWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormVehicleWizardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormVehicleWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
