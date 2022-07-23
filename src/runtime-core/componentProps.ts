import { shallowReadonly } from "../reactivity/reactive";

export function initProps(instance, rawProps) {
  instance.props = shallowReadonly(rawProps || {});
}
