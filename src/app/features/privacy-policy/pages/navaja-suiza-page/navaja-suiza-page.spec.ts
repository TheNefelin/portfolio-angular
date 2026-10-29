import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavajaSuizaPage } from './navaja-suiza-page';

describe('NavajaSuizaPage', () => {
  let component: NavajaSuizaPage;
  let fixture: ComponentFixture<NavajaSuizaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavajaSuizaPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NavajaSuizaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
