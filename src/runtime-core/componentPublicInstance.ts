import { hasOwn } from "../shared/index";
import { unRef } from "../reactivity";

const publicPropertiesMap = {
  $el: i => i.vnode.el,
  $slots: i => i.slots,
};

export const PublicInstanceProxyHandler = {
  get({ _: instance }, key) {
    const { setupState, props } = instance;

    if (hasOwn(setupState, key)) {
      return unRef(setupState[key]);
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    const publicPropertiesGetter = publicPropertiesMap[key];

    if (publicPropertiesGetter) {
      return publicPropertiesGetter(instance);
    }
  },
};
