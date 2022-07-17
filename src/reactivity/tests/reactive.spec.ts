import { isReactive, reactive } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };

    // 生成一个proxy对象
    const obeserved = reactive(original);

    expect(obeserved).not.toBe(original);

    expect(obeserved.foo).toBe(1);

    expect(isReactive(obeserved)).toBe(true);
    expect(isReactive(original)).toBe(false);
  });
});
