import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;

    // 收集依赖
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // user.age++;

    // expect(nextAge).toBe(12);

    user.age += 3;

    expect(nextAge).toBe(14);
  });

  it("effect runner", () => {
    // 通过effect 第二个参数给的的一个scheduler的 fn
    // effect 第一次执行的时候 执行fn 不执行scheduler
    // 发生set 不执行fn 执行scheduler
    // 执行runner 执行fn
    let foo = 10;

    const runner = effect(() => {
      foo++;

      return "foo";
    });

    expect(foo).toBe(11);

    // effect() return 出来一个函数 即runner
    // runner执行 return出来一个结果 即 r
    const r = runner();
    expect(foo).toBe(12);

    expect(r).toBe("foo");
  });

  it("scheduler", () => {
    let dummy;
    let run: any;
    let runner: any;

    const scheduler = jest.fn(() => {
      run = runner;
    });

    const obj = reactive({ foo: 1 });

    runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );

    // 起初 scheduler不会掉用
    expect(scheduler).not.toHaveBeenCalled();

    // 执行effect中的fn
    expect(dummy).toBe(1);

    obj.foo++;

    // 执行的是scheduler 而不是effect中的fn
    expect(scheduler).toBeCalledTimes(1);

    expect(dummy).toBe(1);

    // effect的返回
    run();
    // 执行了 effect中的fn
    expect(dummy).toBe(2);
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });

    obj.prop = 2;

    expect(dummy).toBe(2);

    stop(runner);

    // obj.prop = 3;
    obj.prop++;
    expect(dummy).toBe(2);

    runner();

    expect(dummy).toBe(3);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });

    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    expect(dummy).toBe(1);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
