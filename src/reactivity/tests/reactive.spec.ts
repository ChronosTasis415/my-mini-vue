import { reactive } from "../reactive";


describe('reactive', () => {
  it('happy path', () => {
    const original = {foo:1}

    // 生成一个proxy对象
    const obeserved = reactive(original)

    expect(obeserved).not.toBe(original);

    expect(obeserved.foo).toBe(1)
  }); 
})