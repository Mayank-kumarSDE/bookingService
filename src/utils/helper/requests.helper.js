import { AsyncLocalStorage } from 'async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage();

export const getStore = () => {
  return asyncLocalStorage.getStore();
};

export const getCorrelationId = () => {
  const store = getStore();
  return store?.correlationId;
};