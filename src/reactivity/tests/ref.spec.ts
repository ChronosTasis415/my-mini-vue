import { effect } from "../effect";
import { ref } from "../ref";

describe("red", () => {
  it("happy path", () => {
    const a = ref(1);

    expect(a.value).toBe(1);
  });

  it("ref 应该是响应式的", () => {
    const a = ref(1);

    let dummy;
    let calls = 0;

    effect(() => {
      calls++;
      dummy = a.value;
    });

    expect(calls).toBe(1);
    expect(dummy).toBe(1);

    a.value = 2;

    expect(calls).toBe(2);
    expect(dummy).toBe(2);

    // 相同值不再触发
    a.value = 2;

    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });

  it("使ref嵌套的对象 响应式", () => {
    const a = ref({
      count: 1,
    });

    let dummy;

    effect(() => {
      dummy = a.value.count;
    });

    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });
});
