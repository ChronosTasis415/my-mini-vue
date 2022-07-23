import { initProps } from "./componentProps";
import { PublicInstanceProxyHandler } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: null,
  };

  return component;
}

export function setupComponent(instance) {
  // initProps
  // initSlots
  initProps(instance, instance.vnode.props);
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  const Component = instance.vnode.type;

  // 设置proxy代理 this.something 而不用this.setupState.something
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandler);

  const { setup } = Component;

  if (setup) {
    const setupResult = setup(instance.props);

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const Component = instance.type;

  if (Component.render) {
    instance.render = Component.render;
  }
}
