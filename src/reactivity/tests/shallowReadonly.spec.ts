import { isReadonly, shallowReadonly } from "../reactive";
describe("shadowReadonly", () => {
  it("不使 非响应式对象 变得响应式", () => {
    const props = shallowReadonly({
      n: {
        foo: 1,
      },
    });

    expect(isReadonly(props)).toBe(true);

    expect(isReadonly(props.n)).toBe(false);
  });
});
