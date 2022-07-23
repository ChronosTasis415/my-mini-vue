import { isObject } from "../shared/index";
import {
  mutableHandler,
  readonlyHandler,
  shallowReadonlyHandler,
} from "./baseHandlers";
export const enum ReactiveFlags {
  IS_REACTIVE = "is_reactive",
  IS_READONLY = "is_readonly",
}
function createActiveObject(raw, baseHandlers) {
  if (!isObject(raw)) {
    console.warn(`raw: ${raw} is not a project`);
    return raw;
  }
  return new Proxy(raw, baseHandlers);
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandler);
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandler);
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandler);
}

export function isReactive(value) {
  // value为proxy对象时 触发了get操作 会进入到getter里面
  // value为普通对象时，转换为bool返回
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(raw) {
  return isReactive(raw) || isReadonly(raw);
}
