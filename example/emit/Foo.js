import { h } from "../../lib/guide-mini-vue.es.js";

export const Foo = {
  setup(props, {emit}) {
    console.log(props);
    props.count++;

    const emitAdd = () => {
      console.log('emit add');
      // emit('add', 11, 32, 44)
      emit('add-foo', { a: 1, b: 2 })
    }

    return {
      emitAdd
    }
  },

  render() {
    const btn =h('button', {
      onClick: this.emitAdd
    }, 'button')
    const foo = h('p', {}, 'foo')
    return h('div', {}, [btn, foo])
  }
}