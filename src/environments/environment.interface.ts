export interface Environment {
  production: boolean;
  apiVersion: StudioAPIVersion;
  url: { app, api, assets };
  preview: { cookie };
  auth: { cookie, header };

  [otherProps: string]: any;
}
