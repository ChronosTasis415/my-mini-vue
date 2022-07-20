import { isReactive, reactive, isProxy } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };

    // 生成一个proxy对象
    const obeserved = reactive(original);

    expect(obeserved).not.toBe(original);

    expect(obeserved.foo).toBe(1);

    expect(isReactive(obeserved)).toBe(true);
    expect(isReactive(original)).toBe(false);
    // isProxy 检测对象是否由 reactive或者readonly创建
    expect(isProxy(obeserved)).toBe(true);
  });

  // 嵌套的响应式对象
  it("nested reactive", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };

    const observed = reactive(original);

    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});
