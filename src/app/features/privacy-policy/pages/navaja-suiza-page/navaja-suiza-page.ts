import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-navaja-suiza-page',
  templateUrl: './navaja-suiza-page.html',
})
export class NavajaSuizaPage {
  protected readonly titles = {
    es: ['NavajaSuiza — Política de Privacidad', 'Última actualización: 19 de septiembre de 2026', 'Política de privacidad'],
    en: ['NavajaSuiza — Privacy Policy', 'Last updated: September 19, 2026', 'Privacy Policy'],
    sv: ['NavajaSuiza — Integritetspolicy', 'Senast uppdaterad: 19 september 2026', 'Integritetspolicy'],
  }
}
