import { IApplicationClose, IApplicationEvent, Type } from '../contract';

export const APPLICATION_BEFORE_EVENT_METADATA: Type<IApplicationEvent>[] = [];

export const APPLICATION_AFTER_EVENT_METADATA: Type<IApplicationEvent>[] = [];

export const APPLICATION_CLOSE_METADATA: Type<IApplicationClose>[] = [];

export function ApplicationBeforeEvent() {
    return (target: Type<IApplicationEvent>) => {
        APPLICATION_BEFORE_EVENT_METADATA.push(target);
    }
}

export function ApplicationAfterEvent() {
    return (target: Type<IApplicationEvent>) => {
        APPLICATION_AFTER_EVENT_METADATA.push(target);
    }
}

export function ApplicationClose() {
    return (target: Type<IApplicationClose>) => {
        APPLICATION_CLOSE_METADATA.push(target);
    }
}
