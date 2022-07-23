import { h } from "../../lib/guide-mini-vue.es.js";
import {Foo} from './Foo.js'
export const App = {
  render() {
    return h(
      "div",
      {
        id: 'root',
        onClick: this.divClick
      },
      [
        h('div', {}, 'app'),
        h(Foo, {
          onAddFoo(res) {
            console.log('from add', res);
          }
        })
      ]
    );
  },

  setup() {
    const divClick = () => {
      console.log('click')
    }
    return {
      divClick
    };
  },
};
