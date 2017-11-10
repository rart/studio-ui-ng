import { TestBed, inject } from '@angular/core/testing';

import { StudioHttpService } from './http.service';

describe('StudioHttpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StudioHttpService]
    });
  });

  it('should be created', inject([StudioHttpService], (service: StudioHttpService) => {
    expect(service).toBeTruthy();
  }));
});
