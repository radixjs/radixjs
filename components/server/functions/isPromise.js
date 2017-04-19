function isPromise(value) {
    return value instanceof Promise || (value !== 'undefined' && typeof value.then === 'function');
}