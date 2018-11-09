import { Environment } from './environment.interface';

export const environment: Environment = {

  production: false,

  url: {
    app: '/studio/static-assets/alpha',
    api: '/studio/api/1/services/api/1',
    assets: '/studio/static-assets/alpha/assets',
    preview: 'http://localhost:8080'
  },

  cfg: {
    timeout: 600000 // ten minutes
  },

  // TODO: change all references to use environment.url
  appUrl: '/app',
  assetsUrl: '/assets',
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

}
