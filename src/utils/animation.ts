import * as isAnimated from 'is-animated';

export function checkAnimated(buffer: Buffer): boolean {
    return isAnimated(buffer);
}
