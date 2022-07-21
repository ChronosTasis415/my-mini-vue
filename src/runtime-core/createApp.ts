import { render } from "./render";
import { createVNode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 转换vnode
      // 后续所有逻辑操作基于vnode

      const vnode = createVNode(rootComponent);

      render(vnode, rootContainer);
    },
  };
}
