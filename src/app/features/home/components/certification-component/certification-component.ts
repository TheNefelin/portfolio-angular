import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

export interface CertificationModel {
  id: number;
  url: string;
  img: string;
  alt: string;
  title: string;
}

@Component({
  imports: [NgOptimizedImage],
  selector: 'app-certification-component',
  templateUrl: './certification-component.html',
})
export class CertificationComponent {
  protected readonly certifications: CertificationModel[] = [
    {
      id: 1,
      url:"https://www.acreditta.com/credential/63c99def-c48d-4495-aab5-00a3158d10a0",
      img: "/images/td_js_400x400.webp",
      alt: "JavaScript Certification",
      title: "JavaScript",
    },
    {
      id: 2,
      url:"https://www.acreditta.com/credential/67c91ad1-66c6-4fbd-9319-0bc7e3ad89f3",
      img: "/images/td_java_400x400.webp",
      alt: "Java Spring Boot Certification",
      title: "Java Spring Boot",
    },
    {
      id: 3,
      url:"https://www.acreditta.com/credential/0e81008b-e358-44f9-a9af-67b667adc802",
      img: "/images/td_aws_400x400.webp",
      alt: "AWS Certification",
      title: "AWS",
    },
  ]
}
