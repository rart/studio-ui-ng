import {
  sequence,
  trigger,
  animate,
  style,
  group,
  query,
  transition,
  animateChild,
  state,
  animation,
  useAnimation,
  stagger
} from '@angular/animations';

const ROUTER_WRAPPER = '.main.router.wrapper';

export function slideLeftTransitionBody(selector) {
  return [
    query(`${selector} > :enter, ${selector} > :leave`, [
      style({
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      })
    ], { optional: true }),
    query(`${selector} > :enter`, [
      style({
        transform: 'translateX(100%)',
        opacity: 0
      })
    ], { optional: true }),
    sequence([
      group([
        query(`${selector} > :leave`, [
          style({
            transform: 'translateX(0)',
            opacity: 1
          }),
          animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({
            transform: 'translateX(-100%)',
            opacity: 0
          }))
        ], { optional: true }),
        query(`${selector} > :enter`, [
          style({ transform: 'translateX(100%)' }),
          animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({
            transform: 'translateX(0%)',
            opacity: 1
          }))
        ], { optional: true })
      ]),
      query(`${selector} > :leave`, animateChild(), { optional: true }),
      query(`${selector} > :enter`, animateChild(), { optional: true })
    ])
  ];
}

export const routerAnimations = [
  trigger('navigation', [
    transition('* => fadeIn', group([
      query(`${ROUTER_WRAPPER} > :enter, ${ROUTER_WRAPPER} > :leave`, [
        style({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        })
      ], { optional: true }),
      query(`${ROUTER_WRAPPER} > :enter`, [
        style({ opacity: 0 })
      ], { optional: true }),
      query(`${ROUTER_WRAPPER} > :leave`, [
        style({ opacity: 1 }),
        animate('300ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({ opacity: 0 }))
      ], { optional: true }),
      query(`${ROUTER_WRAPPER} > :enter`, [
        style({ opacity: 0 }),
        animate('300ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({ opacity: 1 }))
      ], { optional: true }),
      query(`${ROUTER_WRAPPER} > :enter`, animateChild(), { optional: true }),
      query(`${ROUTER_WRAPPER} > :leave`, animateChild(), { optional: true })
    ])),
    transition('* => slideLeft', [
      query(`${ROUTER_WRAPPER} > :enter, ${ROUTER_WRAPPER} > :leave`, [
        style({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        })
      ], { optional: true }),
      query(`${ROUTER_WRAPPER} > :enter`, [
        style({
          transform: 'translateX(100%)',
          opacity: 0
        })
      ], { optional: true }),
      sequence([
        group([
          query(`${ROUTER_WRAPPER} > :leave`, [
            style({
              transform: 'translateX(0)',
              opacity: 1
            }),
            animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({
              transform: 'translateX(-100%)',
              opacity: 0
            }))
          ], { optional: true }),
          query(`${ROUTER_WRAPPER} > :enter`, [
            style({ transform: 'translateX(100%)' }),
            animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({
              transform: 'translateX(0%)',
              opacity: 1
            }))
          ], { optional: true })
        ]),
        query(`${ROUTER_WRAPPER} > :leave`, animateChild(), { optional: true }),
        query(`${ROUTER_WRAPPER} > :enter`, animateChild(), { optional: true })
      ])
    ]),
    transition('* => slideRight', [
      query(`${ROUTER_WRAPPER} > :enter, ${ROUTER_WRAPPER} > :leave`, [
        style({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        })
      ], { optional: true }),
      query(`${ROUTER_WRAPPER} > :enter`, [
        style({
          transform: 'translateX(-100%)',
          opacity: 0
        })
      ], { optional: true }),
      sequence([
        group([
          query(`${ROUTER_WRAPPER} > :leave`, [
            style({
              transform: 'translateX(0)',
              opacity: 1
            }),
            animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
              style({
                transform: 'translateX(100%)',
                opacity: 0
              }))
          ], { optional: true }),
          query(`${ROUTER_WRAPPER} > :enter`, [
            style({ transform: 'translateX(-100%)' }),
            animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
              style({
                transform: 'translateX(0%)',
                opacity: 1
              }))
          ], { optional: true })
        ]),
        query(`${ROUTER_WRAPPER} > :leave`, animateChild(), { optional: true }),
        query(`${ROUTER_WRAPPER} > :enter`, animateChild(), { optional: true })
      ])
    ]),
    transition('* => slideUp', [
      query(`${ROUTER_WRAPPER} > :enter, ${ROUTER_WRAPPER} > :leave`, [
        style({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        })
      ], { optional: true }),
      query(`${ROUTER_WRAPPER} > :enter`, [
        style({
          transform: 'translateY(100%)',
          opacity: 0
        })
      ], { optional: true }),
      group([
        query(`${ROUTER_WRAPPER} > :leave`, [
          style({
            transform: 'translateY(0)',
            opacity: 1
          }),
          animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
            style({
              transform: 'translateY(-100%)',
              opacity: 0
            }))
        ], { optional: true }),
        query(`${ROUTER_WRAPPER} > :enter`, [
          style({ transform: 'translateY(100%)' }),
          animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
            style({
              transform: 'translateY(0%)',
              opacity: 1
            }))
        ], { optional: true })
      ]),
      query(`${ROUTER_WRAPPER} > :leave`, animateChild(), { optional: true }),
      query(`${ROUTER_WRAPPER} > :enter`, animateChild(), { optional: true })
    ]),
    transition('* => slideDown', [
      query(`${ROUTER_WRAPPER} > :enter, ${ROUTER_WRAPPER} > :leave`, [
        style({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        })
      ], { optional: true }),
      query(`${ROUTER_WRAPPER} > :enter`, [
        style({
          transform: 'translateY(-100%)',
          opacity: 0
        })
      ], { optional: true }),
      sequence([
        group([
          query(`${ROUTER_WRAPPER} > :leave`, [
            style({
              transform: 'translateY(0)',
              opacity: 1
            }),
            animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
              style({
                transform: 'translateY(100%)',
                opacity: 0
              }))
          ], { optional: true }),
          query(`${ROUTER_WRAPPER} > :enter`, [
            style({ transform: 'translateY(-100%)' }),
            animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
              style({
                transform: 'translateY(0%)',
                opacity: 1
              }))
          ], { optional: true })
        ]),
        query(`${ROUTER_WRAPPER} > :leave`, animateChild(), { optional: true }),
        query(`${ROUTER_WRAPPER} > :enter`, animateChild(), { optional: true })
      ])
    ])
  ])
];

const NAVBAR = 'std-';

export const navBarAnimations = [
  trigger('visibility', [
    state('minimised', style({
      transform: 'translateX(-100%)',
      display: 'none',
      opacity: 0,
      width: 0
    })),
    transition('* => *', animate(250))
  ])
];
