import { h } from "../../lib/guide-mini-vue.es.js";

export const Foo = {
  setup(props) {
    console.log(props);
    props.count++;

    const emitAdd = () => {
      //
    }

    return {
      emitAdd
    }
  },

  render() {
    const btn =h('button', {
      onClick: this.emitAdd
    })
    return h('div', {}, `foo: ${this.count}`)
  }
}