## vue reactivity 模块

Vue3 响应式原理基于 Proxy 对象中的 handler 对目标对象的行为（查询，赋值，遍历等）进行拦截

`const reactiviObj = new Proxy(obj, { get(target, key) { track() // 依赖收集 } set() { trigger() // 依赖触发 } })`

handler 对象常用方法
| 方法 | 描述 |
| :-: | :-: |
|handler.has()|捕捉 in 操作符|
|handler.get()|捕捉 读取操作|
|handler.set()|捕捉 赋值操作|
|handler.deleteProperty()|捕捉 删除 操作符|
|handler.apply()|捕捉 函数调用 操作符|
|handler.construct()|捕捉 new 操作符|
|handler.ownKeys()|捕捉 Object.getOwnPropertyNames 和 Object.getOwnPropertySymbols 操作符|

### proxy

试想每次我们进行查询操作时，例如 user.name。都发生了什么；
进行赋值操作时，例如 user.name = 'zhzh' 又发生了什么:

触发 handler 中的 get 操作, 可拦截获取过程;
出发 handler 中的 set 操作, 可拦截赋值（变更）过程；

reactivity 可以看作只是将对象包装了一下 返回了一个 proxy 对象。

### effect

如上所述，在读取变量时，需要去收集依赖；再变更变量时，需要去触发依赖。而这个中间过程，需要用副作用钩子 effect 去实现。effect 是 vue3 响应式系统的核心。

effect(fn)执行就会调用其中的 fn. fn 为用户的行为 例如: smt = reactiveObj do smh

- reactive -> createReactivityObj -> new Proxy() -> get() / set()
- init -> effect(fn) -> fn() -> 获取 reactiveObj 属性等操作触发 get -> 执行 track() -> 将依赖收集起来
- update -> 变更 reactiveObj 触发 set -> 执行 trigger() -> 遍历依赖执行 .run() -> 又触发 set ->执行 track() -> 将新的依赖收集起来

### track & trigger

track 顾名思义 追踪。

- 采用 Map 类型 targetMap.set(target, depsMap);target 作为 key, depsMap 依赖集合作为 value 将 target 对应的依赖集合保存起来。
- depsMap.set(key, effects) 将 key 作为键，对应的 effects（包含用户动作的 fn）保存起来
- dep.add(effect) 将每个 effect 存入 Set 类型的 effects 中（有上步骤 key 为索引）

trigger 扣动扳机

- depsMap = targetMap.get(target),获取 target 键对应的依赖集合
- deps = depsMap.get(key)，获取 key 对应的 effects
- 遍历 deps 中的每个 dep 执行 run 方法，即执行用户的动作 fn.

需要注意！
当我们执行 get 时，只执行了 track。
当我们执行 set 时，先执行 track 再执行 trigger。
