const publicPropertiesMap = {
  $el: i => i.vnode.el,
};

export const PublicInstanceProxyHandler = {
  get({ _: instance }, key) {
    const { setupState } = instance;
    if (key in setupState) {
      return setupState[key];
    }

    const publicPropertiesGetter = publicPropertiesMap[key];

    if (publicPropertiesGetter) {
      return publicPropertiesGetter(instance);
    }
  },
};
