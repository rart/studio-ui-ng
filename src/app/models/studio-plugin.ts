
export interface StudioPlugin {
  readonly tag: string; // 'div' | 'section' | 'span' | '...'
  readonly classes: string;

  [props: string]: any;

  create(node, host): any;
  destroy(): void;
}
