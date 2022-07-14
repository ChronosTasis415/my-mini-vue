let activeEffect;
// 将传入的fn 进行包装 变成类的私有变量 外部访问不到(只能在类中访问)
class ReactiveEffect {
  private _fn;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }

  run() {
    activeEffect = this;
    return this._fn();
  }
}



export function effect(fn, options:any = {}) {
  const {scheduler } = options;
  const _effect = new ReactiveEffect(fn, scheduler);

  // 首次执行的时候 只执行runner 不管有没有scheduler
  _effect.run();
  
  // bind 绑定实例对象 
  return _effect.run.bind(_effect);
}

const targetMap = new Map();

// 收集依赖
export function track(target, key) {

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

  dep.add(activeEffect);

  // targetMap  {{target} => Map(1)}
  // depsMap { key => Set(1) }
  //dep [ReactiveEffect]
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
