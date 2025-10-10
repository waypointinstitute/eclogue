export type Subscriber<T> = (value: T) => void;

export function reactive<T extends Record<string, unknown>>(initial: T): T & {
  subscribe: (fn: Subscriber<T>) => () => void;
} {
  const subscribers = new Set<Subscriber<T>>();
  const proxyCache = new WeakMap<object, any>();

  const notify = (value: T) => {
    for (const sub of subscribers) sub(value);
  };

  const wrap = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (proxyCache.has(obj)) return proxyCache.get(obj);
    const proxy = new Proxy(obj, {
      set(target, prop, value) {
        const result = Reflect.set(target, prop, value);
        notify(rootProxy);
        return result;
      },
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        return wrap(value);
      }
    });
    proxyCache.set(obj, proxy);
    return proxy;
  };

  const rootProxy = wrap(initial);

  Object.defineProperty(rootProxy, 'subscribe', {
    value: (fn: Subscriber<T>) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }
  });

  return rootProxy as T & { subscribe: (fn: Subscriber<T>) => () => void };
}
