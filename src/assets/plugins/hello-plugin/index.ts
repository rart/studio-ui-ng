// import { StudioPlugin } from '@craftercms/models';

declare var define;

define([], () => {

  const Bundle/*: StudioPlugin */ = {
    tag: 'div',
    classes: '',
    instance: null,
    destroy: function () {
      Bundle.instance.destroy();
    },
    create: function (node, host) {

      let subscription;
      let updates = 0;

      let instance = {
        host: host,
        initialize() {
          console.log('Hello from the plugin world!');
          subscription = host.subscribe(() => {
            updates++;
            this.render();
          });
        },
        destroy() {
          subscription();
          console.log('Bye bye from plugin.');
        },
        render() {
          let sessions = host.getState().editSessions.order.length;
          node.innerHTML = `
            <div class="pad lg all center text">
              <button class="mat-raised-button mat-icon-button mat-accent" color="accent" mat-raised-button mat-button>
                <span class="mat-button-wrapper">
                  <i class="material-icons" role="img" aria-hidden="true">menu</i>
                </span>
              </button>
              <h2>Hello, plugin world!</h2>
              <div>You have currently ${sessions} active sessions</div>
              <div class="muted text">I've received ${updates} update(s).</div>
            </div>`;
          node.querySelector('button').addEventListener('click', () => {
            host.dispatch({ type: 'TOGGLE_SIDEBAR' });
          }, false);
        }
      };

      instance.initialize();
      instance.render();

      Bundle.instance = instance;

    }
  };

  return Bundle;

});
