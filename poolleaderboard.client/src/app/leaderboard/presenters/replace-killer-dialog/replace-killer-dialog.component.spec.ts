import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NbDialogRef, NbThemeModule } from '@nebular/theme';

import { ReplaceKillerDialogComponent } from './replace-killer-dialog.component';

describe('ReplaceKillerDialogComponent', () => {
  let fixture: ComponentFixture<ReplaceKillerDialogComponent>;
  let component: ReplaceKillerDialogComponent;
  let dialogRef: jasmine.SpyObj<NbDialogRef<ReplaceKillerDialogComponent>>;

  const text = () => (fixture.nativeElement.querySelector('#replace-killer-message') as HTMLElement).textContent!.replace(/\s+/g, ' ');
  const button = (id: string) => fixture.nativeElement.querySelector(id) as HTMLButtonElement;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('NbDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [ReplaceKillerDialogComponent, NbThemeModule.forRoot()],
      providers: [{ provide: NbDialogRef, useValue: dialogRef }]
    }).compileComponents();

    fixture = TestBed.createComponent(ReplaceKillerDialogComponent);
    component = fixture.componentInstance;
  });

  it('should say a game is already in progress and that starting a new one abandons it', () => {
    fixture.detectChanges();
    expect(text()).toContain('A killer game is already in progress');
    expect(text()).toContain('abandon it');
  });

  it('should list the players in the game in progress', () => {
    component.playerNames = ['Alice A', 'Bob B', 'Carol C'];
    fixture.detectChanges();
    expect(text()).toContain('in progress with Alice A, Bob B, Carol C.');
  });

  it('should not mention players when none are given', () => {
    fixture.detectChanges();
    expect(text()).toContain('in progress.');
    expect(text()).not.toContain(' with ');
  });

  it('should close with true from a danger-styled confirm button', () => {
    fixture.detectChanges();
    const confirm = button('#replace-killer-confirm');
    expect(confirm.textContent).toContain('Abandon & start new');
    expect(confirm.className).toContain('status-danger');
    confirm.click();
    expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
  });

  it('should close with false when cancelled', () => {
    fixture.detectChanges();
    button('#replace-killer-cancel').click();
    expect(dialogRef.close).toHaveBeenCalledOnceWith(false);
  });
});
