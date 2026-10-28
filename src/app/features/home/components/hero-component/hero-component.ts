import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  imports: [NgOptimizedImage],
  selector: 'app-hero-component',
  templateUrl: './hero-component.html',
})
export class HeroComponent {}
