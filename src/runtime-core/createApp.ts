import { createVNode } from "./vnode";

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 转换vnode
        // 后续所有逻辑操作基于vnode

        const vnode = createVNode(rootComponent);

        render(vnode, rootContainer);
      },
    };
  };
}
