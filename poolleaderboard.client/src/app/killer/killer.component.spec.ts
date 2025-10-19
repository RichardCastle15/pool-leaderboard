import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KillerComponent } from './killer.component';
import { NbIconModule, NbThemeModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

describe('KillerComponent', () => {
  let component: KillerComponent;
  let fixture: ComponentFixture<KillerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KillerComponent,  NbThemeModule.forRoot(), NbIconModule, NbEvaIconsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KillerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
