import { PartialObserver } from 'rxjs/Observer';

export declare type AnyObserver<T> = (value: T) => void | PartialObserver<T>;

export declare type AnySubscriber = (value: any) => void | PartialObserver<any>;
