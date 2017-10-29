# Studio NG UI

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.7.

To run connected to your local studio instance:
* Run `ng serve`
* Run Crafter Studio (e.g. `./gradlew -Penv=authoring start`)
* Configure your apache server httpd.conf (e.g. from MAMP) with the configuration below. Paste it right after the `ServerName locahost:XXXX` entry on your file. 
* If your apache runs for example on port 8888 (like MAMP does), vising `localhost:8888/studio` and login to studio
* Visit `localhost:8888`

```
ProxyRequests On
ProxyVia On

ProxyPreserveHost On

    ProxyPass /studio http://localhost:8080/studio
    ProxyPassReverse /studio http://localhost:8080/studio
   
    ProxyPass /prev http://localhost:8080/
    ProxyPassReverse /prev http://localhost:8080/
   
    ProxyPass /static-assets http://localhost:8080/static-assets
    ProxyPassReverse /static-assets http://localhost:8080/static-assets
   
    ProxyPass / http://localhost:4200/
    ProxyPassReverse / http://localhost:4200/
```

**FYI.**
- On a mac/MAMP, the httpd.conf is at `/Applications/MAMP/conf/apache`
- With this config, preview on /studio won't work well. However, `/prev` would render the current selected site like `/` would on a normal studio instance.

## TODOs
- Move directories into sub packages (e.g. studio/core, studio/models, studio/services, etc) to achieve better extensibility
- PoC a plugin and plugin system
- Figure i18n in TypeScript files & test the i18n attributes on templates
- Styles & theming R&D
- Finish validations prior to submitting user editing requests
- API/HTTP error handling
- Auth

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
