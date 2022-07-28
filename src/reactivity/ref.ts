import { hasChanged, isObject } from "../shared/index";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";
class RefImpl {
  private _value: any;
  private dep;
  private _originalRaw;

  //创建之初就声明是否为ref
  public __v_isRef = true;
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
  console.log("effect", effect);
  if (isTracking()) {
    trackEffects(effect.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__v_isRef;
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },

    set(target, key, value) {
      return Reflect.set(target, key, isRef(value) ? value : ref(value));
    },
  });
}
