const MAX_EVENT_LOG = 200;

function getGlobalStore() {
  if (typeof window === 'undefined') return null;
  if (window.__kvPerfDebugStore) return window.__kvPerfDebugStore;

  const store = {
    enabled: false,
    counters: {},
    durations: {},
    events: [],
  };

  store.reset = () => {
    store.counters = {};
    store.durations = {};
    store.events = [];
  };

  store.snapshot = () => ({
    enabled: store.enabled,
    counters: { ...store.counters },
    durations: Object.fromEntries(
      Object.entries(store.durations).map(([key, value]) => [key, { ...value }])
    ),
    events: store.events.map((entry) => ({ ...entry })),
  });

  window.__kvPerfDebugStore = store;
  window.__kvPerf = {
    reset: () => store.reset(),
    snapshot: () => store.snapshot(),
  };
  return store;
}

function isEnabled() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('perfDebug') === '1';
}

export function initPerfDebug() {
  const store = getGlobalStore();
  if (!store) return;
  store.enabled = isEnabled();
  if (!store.enabled) {
    store.reset();
  }
}

export function perfCounter(name, delta = 1) {
  const store = getGlobalStore();
  if (!store?.enabled) return;
  store.counters[name] = (store.counters[name] || 0) + delta;
}

export function perfEvent(name, detail = {}) {
  const store = getGlobalStore();
  if (!store?.enabled) return;
  store.events.push({
    name,
    ts: typeof performance !== 'undefined' ? performance.now() : Date.now(),
    ...detail,
  });
  if (store.events.length > MAX_EVENT_LOG) {
    store.events.splice(0, store.events.length - MAX_EVENT_LOG);
  }
}

export function perfStart() {
  const store = getGlobalStore();
  if (!store?.enabled || typeof performance === 'undefined') return null;
  return performance.now();
}

export function perfEnd(name, startedAt, extra = {}) {
  const store = getGlobalStore();
  if (!store?.enabled || startedAt === null || typeof performance === 'undefined') return;

  const duration = performance.now() - startedAt;
  const current = store.durations[name] || {
    count: 0,
    total: 0,
    max: 0,
    min: Number.POSITIVE_INFINITY,
    last: 0,
  };

  current.count += 1;
  current.total += duration;
  current.max = Math.max(current.max, duration);
  current.min = Math.min(current.min, duration);
  current.last = duration;
  store.durations[name] = current;

  if (Object.keys(extra).length > 0) {
    perfEvent(`${name}:sample`, {
      duration,
      ...extra,
    });
  }
}
