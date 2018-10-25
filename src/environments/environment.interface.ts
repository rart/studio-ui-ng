export interface Environment {
  production: boolean;
  apiVersion: StudioAPIVersion;
  url: { app, api, assets, preview };
  preview: { cookie };
  auth: { cookie, header };

  [otherProps: string]: any;
}
