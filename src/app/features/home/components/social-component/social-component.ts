import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

export interface SocialModel {
  id: number;
  url: string;
  img: string;
  alt: string;
  color: string;
}

@Component({
  imports: [NgOptimizedImage],
  selector: 'app-social-component',
  templateUrl: './social-component.html',
})
export class SocialComponent {
  protected readonly socials: SocialModel[] = [
    {
      id: 1,
      url:"https://github.com/thenefelin",
      img: "/images/social_github.webp",
      alt: "GitHub",
      color: "bg-cyan-800",
    },
    {
      id: 2,
      url:"https://www.linkedin.com/in/nefelin",
      img: "/images/social_linkedin.webp",
      alt: "LinkedIn",
      color: "bg-cyan-600",
    },
    //{
    //  id: 3,
    //  url:"https://www.twitch.tv/thenefelin",
    //  img: "/images/social_twitch.webp",
    //  alt: "Twitch",
    //  color: "bg-purple-600",
    //},
    //{
    //  id: 4,
    //  url:"https://www.youtube.com/c/TheNefelin",
    //  img: "/images/social_youtube.webp",
    //  alt: "YouTube",
    //  color: "bg-red-600",
    //},
  ]
}
