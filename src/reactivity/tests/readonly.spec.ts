import { readonly, isReadonly, isProxy } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    // 只读 不可用设置
    const original = {
      foo: 1,
      bar: {
        baz: 2,
      },
    };

    const wrapper = readonly(original);

    expect(wrapper).not.toBe(original);

    expect(wrapper.foo).toBe(1);

    expect(isReadonly(wrapper)).toBe(true);

    expect(isProxy(wrapper)).toBe(true);
  });

  it("warn when call set", () => {
    console.warn = jest.fn();
    const user = readonly({
      age: 10,
    });

    user.age++;
    expect(console.warn).toBeCalled();
  });

  it("使嵌套的值为readonly", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);

    expect(wrapped).not.toBe(original);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(wrapped.bar)).toBe(true);
    expect(isReadonly(original.bar)).toBe(false);
    expect(wrapped.foo).toBe(1);
  });
});
