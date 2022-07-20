import { effect } from "../effect";
import { isRef, ref, unRef, proxyRefs } from "../ref";
import { reactive } from "../reactive";

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

  it("is ref", () => {
    const a = ref(1);
    const user = reactive({
      age: 1,
    });
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(user)).toBe(false);
  });

  it("unref", () => {
    const a = ref(1);
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
  });

  it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: "xiaohong",
    };

    const proxyUser = proxyRefs(user);
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
    expect(proxyUser.name).toBe("xiaohong");

    proxyUser.age = 20;
    expect(proxyUser.age).toBe(20);
    expect(user.age.value).toBe(20);

    proxyUser.age = ref(10);
    expect(proxyUser.age).toBe(10);
    expect(user.age.value).toBe(10);
  });
});
