import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TitleComponent } from './title-component';

describe('TitleComponent', () => {
  let component: TitleComponent;
  let fixture: ComponentFixture<TitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TitleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title', async () => {
    fixture.componentRef.setInput('title', 'someExperience');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('someExperience');
  });

  it('should set the id attribute when provided', async () => {
    fixture.componentRef.setInput('title', 'aboutMe');
    fixture.componentRef.setInput('id', 'id_me');
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('section');
    expect(section?.getAttribute('id')).toBe('id_me');
  });

  it('should not set id when not provided', async () => {
    fixture.componentRef.setInput('title', 'aboutMe');
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('section');
    expect(section?.getAttribute('id')).toBeNull();
  });
});
