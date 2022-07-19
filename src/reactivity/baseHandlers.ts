/** @format */

import { isObject } from "../../shared";
import { track, trigger } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactive";

// 只执行一次 后面创建响应式对象时用缓存值。
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
// 高阶函数 返回fn
function createGetter(isReadonly = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }

    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    const res = Reflect.get(target, key);

    // 检查res是不是object
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);

    trigger(target, key);
    return res;
  };
}
export const mutableHandler = {
  get,
  set,
};

export const readonlyHandler = {
  get: readonlyGet,

  set(target, key, value) {
    console.warn(`${key}不可用被改变，因为${target}是只读的`);
    return true;
  },
};
