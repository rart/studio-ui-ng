import { Component, OnInit } from '@angular/core';
import {ProjectService} from '../../services/project.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'std-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  project;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService) { }

  ngOnInit() {
    this.route.data
      .subscribe(data => this.project = data.project);
  }

}
