// import { StudioPlugin } from '@craftercms/models';
define([], function () {
    var Bundle /*: StudioPlugin */ = {
        tag: 'div',
        classes: '',
        instance: null,
        destroy: function () {
            Bundle.instance.destroy();
        },
        create: function (node, host) {
            var subscription;
            var updates = 0;
            var instance = {
                host: host,
                initialize: function () {
                    var _this = this;
                    console.log('Hello from the plugin world!');
                    subscription = host.subscribe(function () {
                        updates++;
                        _this.render();
                    });
                },
                destroy: function () {
                    subscription();
                    console.log('Bye bye from plugin.');
                },
                render: function () {
                    var sessions = host.getState().editSessions.order.length;
                    node.innerHTML = "\n            <div class=\"pad lg all center text\">\n              <button class=\"mat-raised-button mat-icon-button mat-accent\" color=\"accent\" mat-raised-button mat-button>\n                <span class=\"mat-button-wrapper\">\n                  <i class=\"material-icons\" role=\"img\" aria-hidden=\"true\">menu</i>\n                </span>\n              </button>\n              <h2>Hello, plugin world!</h2>\n              <div>You have currently " + sessions + " active sessions</div>\n              <div class=\"muted text\">I've received " + updates + " update(s).</div>\n            </div>";
                    node.querySelector('button').addEventListener('click', function () {
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
