let activeEffect;
// 将传入的fn 进行包装 变成类的私有变量 外部访问不到(只能在类中访问)
class ReactiveEffect {
  private _fn;
  constructor(fn) {
    this._fn = fn;
  }

  run() {
    activeEffect = this;
    this._fn();
  }
}



export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
}

const targetMap = new Map();
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

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const deps = depsMap.get(key);

  for (const dep of deps) {
    dep.run();
  }
}
