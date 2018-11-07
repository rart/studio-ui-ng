import { Component, Input, OnInit } from '@angular/core';
import { Asset } from '../../models/asset.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'std-form-editor',
  templateUrl: './form-editor.component.html',
  styleUrls: ['./form-editor.component.scss']
})
export class FormEditorComponent implements OnInit {

  @Input() asset: Asset;

  source: SafeResourceUrl;

  loading = true;

  constructor(private sanitizer: DomSanitizer) {

  }

  ngOnInit() {

    const { asset, sanitizer } = this;

    this.source = sanitizer.bypassSecurityTrustResourceUrl(
      `http://35.171.38.46:8080/studio/form?site=${
        asset.projectCode}&form=${asset.contentModelId}&path=${
        `${asset.path}/${asset.fileName}`}&edit=true&editorId=ui-4-editor`
    );

  }

  load() {

  }

}
