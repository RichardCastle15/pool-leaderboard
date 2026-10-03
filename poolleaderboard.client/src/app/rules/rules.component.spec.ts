import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NbThemeModule } from '@nebular/theme';
import { RulesComponent } from './rules.component';

describe('RulesComponent', () => {
  let fixture: ComponentFixture<RulesComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RulesComponent, NbThemeModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RulesComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  function rowColours(): string[][] {
    return Array.from(element.querySelectorAll('.rack-row')).map(row =>
      Array.from(row.querySelectorAll('.ball')).map(ball =>
        ['red', 'yellow', 'black'].find(c => ball.classList.contains(c))!));
  }

  it('draws our rack from front to back', () => {
    expect(rowColours()).toEqual([
      ['yellow'],
      ['yellow', 'red'],
      ['red', 'black', 'yellow'],
      ['yellow', 'red', 'yellow', 'red'],
      ['red', 'yellow', 'red', 'red', 'yellow'],
    ]);
  });

  it('racks seven of each colour and one black', () => {
    const balls = rowColours().flat();
    expect(balls.filter(b => b === 'red').length).toBe(7);
    expect(balls.filter(b => b === 'yellow').length).toBe(7);
    expect(balls.filter(b => b === 'black').length).toBe(1);
  });

  it('links to the blackball.uk rules guide', () => {
    const link = element.querySelector<HTMLAnchorElement>('a[href*="blackball.uk"]');
    expect(link).not.toBeNull();
  });
});
