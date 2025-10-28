import { IApplicationEvent, Type } from '../contract';

export const APPLICATION_BEFORE_EVENT_METADATA: Type<IApplicationEvent>[] = [];

export const APPLICATION_AFTER_EVENT_METADATA: Type<IApplicationEvent>[] = [];

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
