import { hasChanged, isObject } from "../../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";
class RefImpl {
  private _value: any;
  private dep;
  private _originalRaw;
  constructor(value: any) {
    // 在初始化的时候 判断value的属性是否为object
    this._originalRaw = value;
    this._value = isObject(value) ? reactive(value) : value;
    this.dep = new Set();
  }

  get value() {
    trackRefEffects(this);

    return this._value;
  }

  set value(newValue) {
    if (hasChanged(newValue, this._originalRaw)) {
      this._value = isObject(newValue) ? reactive(newValue) : newValue;
      this._originalRaw = newValue;
      triggerEffects(this.dep);
    }
  }
}

function trackRefEffects(effect) {
  if (isTracking()) {
    trackEffects(effect.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}
