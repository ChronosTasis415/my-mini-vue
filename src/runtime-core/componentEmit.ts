import { camelize, toHandlerKey } from "../shared/index";

export function emit(instance, event, ...args) {
  const { props } = instance;

  // 去触发props中传过来的event
  const handler = toHandlerKey(camelize(event));
  props[handler] && props[handler](...args);
}
