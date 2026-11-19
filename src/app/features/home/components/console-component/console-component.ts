import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { repeat, take, tap } from 'rxjs/operators';

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

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Ciclo: espera 1s → escribe char por char (40ms) → pausa 3 min → limpia → repite.
    // takeUntilDestroyed cancela automáticamente al destruir el componente.
    timer(1000, 40).pipe(
      take(this.fullText.length),
      tap((index) => {
        if (index === 0) this.displayedText.set(''); // limpia al inicio de cada ciclo
        this.displayedText.update((text) => text + this.fullText.charAt(index));
      }),
      repeat({ delay: 180000 }), // 3 min de pausa antes de reiniciar
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }
}