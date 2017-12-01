import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'std-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit {

  @Input() src;
  @Input() type = 'video/mp4';

  constructor() { }

  ngOnInit() {
  }

}
