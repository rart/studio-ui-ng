export interface Environment {
  production: boolean;
  apiVersion: StudioAPIVersion;
  url: { app, api, assets };
  project: { cookie };
  auth: { cookie, header };

  [otherProps: string]: any;
}
