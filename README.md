# Studio UI X

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.7 and has now been migrated to cli version 1.5.0.

## Pre-requisites
* Node
  * Run `yarn` (preferred) or `npm install` on this directory.
  * For extra credit `ng set --global packageManager=yarn`
* A local [CrafterCMS Instance](https://github.com/craftercms/craftercms) 
  * `git clone https://github.com/craftercms/craftercms`
  * `cd craftercms` and `./gradlew -Penv=authoring init build deploy`
  * `./gradlew -Penv=authoring stop update build deploy start` to pull/update rebuild & restart
  * `./gradlew -Penv=authoring start` to run
* An apache server (e.g. use [MAMP](https://www.mamp.info/)) 
  * Configure your apache server `httpd.conf` with the configuration below. _Paste it right after the `ServerName locahost:XXXX` entry on your `httpd.conf` file._
    ```
    ProxyRequests On
    ProxyVia On
    
    ProxyPreserveHost On
    
        ProxyPass           /app        http://localhost:4200/
        ProxyPassReverse    /app        http://localhost:4200/
    
        ProxyPass           /guest      http://localhost:3000/
        ProxyPassReverse    /guest      http://localhost:3000/
    
        ProxyPass           /           http://localhost:8080/
        ProxyPassReverse    /           http://localhost:8080/
    ```
  * FYI: On a mac/MAMP 
    * The `httpd.conf` is at `/Applications/MAMP/conf/apache`
    * Start apache with `/Applications/MAMP/Library/bin/apachectl start`
    * Stop apache with `/Applications/MAMP/Library/bin/apachectl stop`
    * Alternative to MAMP, on for mac see osxdaily.com/2012/09/02/start-apache-web-server-mac-os-x/

## Development server

* Run your local Crafter
* Run your apache
* Run `yarn begin` (or `npm run begin`)
* If your apache runs on port 8888 — like MAMP does, visit `localhost:8888/studio` and login to studio
* Visit `localhost:8888/app` to see this Angular app. The app will automatically reload if you change any of the source files.

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

## TODOs
- Make a main repo and move the UI app into a sub package. Same for other sub packages (e.g. studio/core, studio/models, studio/services, etc) [WIP]
- API/HTTP error handling
