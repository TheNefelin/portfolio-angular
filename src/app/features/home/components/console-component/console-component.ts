import { Component, effect, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-console-component',
  templateUrl: './console-component.html',
})
export class ConsoleComponent {
  protected readonly displayedText = signal('');
  
  private readonly fullText =
  'C:\\> As a developer, he has continuously advanced through self-learning and adapting to new technologies, contributing as a problem solver and delivering solutions aligned with client needs.\n\n' +
  'C:\\> He has participated in numerous projects, both independently and collaboratively, maintaining a strong team dynamic.\n\n' +
  'C:\\> He is eager to continue honing his skills in software development, seeking opportunities to tackle new challenges and stay at the forefront of emerging technologies.';

  private textIndex = 0;
  
  private readonly typingEffect = effect((onCleanup) => {
    const timeoutId = setTimeout(() => this.typeText(), 1000);
    onCleanup(() => clearTimeout(timeoutId));
  });

  private typeText(): void {
    if (this.textIndex >= this.fullText.length) return;

    this.displayedText.update(
      text => text + this.fullText.charAt(this.textIndex)
    );

    this.textIndex++;

    setTimeout(() => this.typeText(), 40);
  }
}
