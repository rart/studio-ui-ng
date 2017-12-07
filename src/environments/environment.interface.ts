export interface Environment {
  production: boolean;
  apiVersion: StudioAPIVersion;
  url: { app, api, assets };
  site: { cookie };
  auth: { cookie, header };

  [otherProps: string]: any;
}
