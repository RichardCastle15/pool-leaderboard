import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NbDialogRef, NbThemeModule } from '@nebular/theme';

import { NewParticipantComponent } from './new-participant.component';

describe('NewParticipantComponent', () => {
  let component: NewParticipantComponent;
  let fixture: ComponentFixture<NewParticipantComponent>;
  let dialogRef: jasmine.SpyObj<NbDialogRef<NewParticipantComponent>>;

  const input = (): HTMLInputElement => fixture.debugElement.query(By.css('input')).nativeElement;
  const errorMessage = () => fixture.debugElement.query(By.css('.error-message'));
  const button = (label: string): HTMLButtonElement =>
    fixture.debugElement.queryAll(By.css('button')).map(b => b.nativeElement as HTMLButtonElement).find(b => b.textContent?.trim() === label)!;

  function type(value: string) {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj<NbDialogRef<NewParticipantComponent>>('NbDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [NewParticipantComponent, NbThemeModule.forRoot()],
      providers: [{ provide: NbDialogRef, useValue: dialogRef }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewParticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show an error when the name input is blurred', () => {
    input().focus();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.nameControl.touched).toBeTrue();
    expect(errorMessage()).toBeNull();
  });

  it('should show an error and keep the dialog open when Add is pressed with an invalid name', () => {
    button('Add').click();
    fixture.detectChanges();

    expect(errorMessage()).not.toBeNull();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should keep the error up to date while typing after Add has been pressed', () => {
    button('Add').click();
    fixture.detectChanges();

    type('Richard');
    expect(errorMessage()).not.toBeNull();

    type('Richard C');
    expect(errorMessage()).toBeNull();

    type('Richard');
    expect(errorMessage()).not.toBeNull();
  });

  it('should close the dialog with the name when Add is pressed with a valid name', () => {
    type('Richard C');
    button('Add').click();
    fixture.detectChanges();

    expect(errorMessage()).toBeNull();
    expect(dialogRef.close).toHaveBeenCalledWith('Richard C');
  });

  it('should close the dialog without a result when Cancel is pressed', () => {
    button('Cancel').click();

    expect(dialogRef.close).toHaveBeenCalledOnceWith();
  });

  it('should close the dialog on Cancel after the input has been blurred', () => {
    input().focus();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    button('Cancel').click();

    expect(errorMessage()).toBeNull();
    expect(dialogRef.close).toHaveBeenCalledOnceWith();
  });
});
