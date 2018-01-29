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

export function fadeInEntryQueries(selector) {
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
      style({ opacity: 0 })
    ], { optional: true }),
    query(`${selector} > :leave`, [
      style({ opacity: 1 }),
      animate('300ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({ opacity: 0 }))
    ], { optional: true }),
    query(`${selector} > :enter`, [
      style({ opacity: 0 }),
      animate('300ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({ opacity: 1 }))
    ], { optional: true }),
    query(`${selector} > :enter`, animateChild(), { optional: true }),
    query(`${selector} > :leave`, animateChild(), { optional: true })
  ];
}

export function slideLeftEntry(selector) {
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

export function slideRightEntry(selector) {
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
        transform: 'translateX(-100%)',
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
          animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
            style({
              transform: 'translateX(100%)',
              opacity: 0
            }))
        ], { optional: true }),
        query(`${selector} > :enter`, [
          style({ transform: 'translateX(-100%)' }),
          animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
            style({
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

export function slideUpEntry(selector) {
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
        transform: 'translateY(100%)',
        opacity: 0
      })
    ], { optional: true }),
    group([
      query(`${selector} > :leave`, [
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
      query(`${selector} > :enter`, [
        style({ transform: 'translateY(100%)' }),
        animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
          style({
            transform: 'translateY(0%)',
            opacity: 1
          }))
      ], { optional: true })
    ]),
    query(`${selector} > :leave`, animateChild(), { optional: true }),
    query(`${selector} > :enter`, animateChild(), { optional: true })
  ];
}

export function slideDownEntry(selector) {
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
        transform: 'translateY(-100%)',
        opacity: 0
      })
    ], { optional: true }),
    sequence([
      group([
        query(`${selector} > :leave`, [
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
        query(`${selector} > :enter`, [
          style({ transform: 'translateY(-100%)' }),
          animate('600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
            style({
              transform: 'translateY(0%)',
              opacity: 1
            }))
        ], { optional: true })
      ]),
      query(`${selector} > :leave`, animateChild(), { optional: true }),
      query(`${selector} > :enter`, animateChild(), { optional: true })
    ])
  ];
}

const ROUTER_WRAPPER = '.router.wrapper';

export const routerAnimations = [
  trigger('navigation', [
    transition('* => fadeIn', group(fadeInEntryQueries(ROUTER_WRAPPER))),
    transition('* => slideLeft', slideLeftEntry(ROUTER_WRAPPER)),
    transition('* => slideRight', slideRightEntry(ROUTER_WRAPPER)),
    transition('* => slideUp', slideUpEntry(ROUTER_WRAPPER)),
    transition('* => slideDown', slideDownEntry(ROUTER_WRAPPER))
  ])
];

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
