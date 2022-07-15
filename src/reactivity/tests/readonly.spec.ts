import { readonly, isReadonly } from "../reactive";

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
  });

  it("warn when call set", () => {
    console.warn = jest.fn();
    const user = readonly({
      age: 10,
    });

    user.age++;
    expect(console.warn).toBeCalled();
  });
});
