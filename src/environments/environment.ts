// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,

  url: {
    app: '/app',
    api: '/studio/api/1/services/api/1',
    assets: '/app/assets',
  },

  // TODO: change all references to use environment.url
  appUrl: '/app',
  assetsUrl: '/app/assets',
  // http://docs.craftercms.org/en/latest/developers/projects/studio/api/index.html
  apiUrl: '/studio/api/1/services/api/1',

  apiVersion: 'v3',

  preview: {
    cookie: 'crafterSite'
  },

  auth: {
    header: 'X-XSRF-TOKEN',
    cookie: 'XSRF-TOKEN'
  }

};
