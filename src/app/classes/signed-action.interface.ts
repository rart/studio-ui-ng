import { AnyAction } from 'redux';
import { AppState } from './app-state.interface';

export interface SignedAction extends AnyAction {
    affects: Array<keyof AppState>;
}
