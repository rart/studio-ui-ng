import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'std-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnInit {

  @Input() src;
  @Input() type = 'audio/mp3'; // mpeg

  constructor() { }

  ngOnInit() {
  }

}
