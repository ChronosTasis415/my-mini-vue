import { extend } from "../../shared/index";
let activeEffect;
let shouldTrack;
// 将传入的fn 进行包装 变成类的私有变量 外部访问不到(只能在类中访问)
class ReactiveEffect {
  private _fn;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }

  run() {
    // 执行fn 意味着执行get操作 因为fn中有getter

    if (!this.active) {
      return this._fn();
    }

    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();
    // reset
    shouldTrack = false;

    
    return result;
  }

  stop() {
    // 清空一次后 避免多次遍历
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    // Set
    dep.delete(effect);
  });

  effect.deps.length = 0;
}

const targetMap = new Map();

// 收集依赖
export function track(target, key) {
  if (!isTracking()) return;

  // 需要收集的fn不可重复 所以用Set
  // target -> key -> map
  let depsMap = targetMap.get(target);

  if (!depsMap) {
    depsMap = new Map();

    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);

  if (!dep) {
    dep = new Set();

    depsMap.set(key, dep);
  }

  if (dep.has(activeEffect)) return;
  
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

// 触发依赖
export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const deps = depsMap.get(key);

  for (const dep of deps) {
    if (dep.scheduler) {
      dep.scheduler();
    } else {
      dep.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);

  extend(_effect, options); // _effect.onStop = onStop;
  // 首次执行的时候 只执行runner 不管有没有scheduler
  _effect.run();

  // bind 绑定实例对象
  const runner: any = _effect.run.bind(_effect);

  runner.effect = _effect;

  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
