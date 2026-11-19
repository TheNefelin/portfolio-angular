import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsoleComponent } from './console-component';

describe('ConsoleComponent', () => {
  let component: ConsoleComponent;
  let fixture: ComponentFixture<ConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsoleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty text', () => {
    expect((component as unknown as { displayedText: () => string }).displayedText()).toBe('');
  });

  it('should not throw on destroy', () => {
    fixture.detectChanges();
    fixture.destroy();
    expect(true).toBe(true);
  });
});
