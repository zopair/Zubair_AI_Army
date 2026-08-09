const PROVIDERS = new Map();

export function registerProvider(name, adapter) {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error('invalid provider name');
  if (!adapter || typeof adapter.plan !== 'function') throw new Error('provider must expose plan(task)');
  PROVIDERS.set(name, adapter);
}

export function getProvider(name) {
  const provider = PROVIDERS.get(name);
  if (!provider) throw new Error(`provider not registered: ${name}`);
  return provider;
}

export function listProviders() {
  return [...PROVIDERS.keys()];
}
