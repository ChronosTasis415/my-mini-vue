import { getCurrentInstance } from "./component";

export function provide(key, value) {
  // 存 在instance实例
  const instance: any = getCurrentInstance();

  if (instance) {
    let { provides } = instance as any;
    const parentProvides = instance.parent.provides;
    // init
    // 初始时 在component Instance中设置了provides = parent.provides
    if (provides === parentProvides) {
      provides = instance.provides = Object.create(parentProvides);
    }

    Reflect.set(provides, key, value);
  }
}

export function inject(key, defaultValue) {
  // 取 从父级的provides中取
  const instance: any = getCurrentInstance();

  if (instance) {
    const parentProvides = instance.parent.provides as any;
    if (key in parentProvides) {
      return Reflect.get(parentProvides, key);
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
