import { isArray } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  //处理组件
  // 区分是组件还是element
  const { type } = vnode;

  if (typeof type === "string") {
    processElement(vnode, container);
  } else {
    processComponent(vnode, container);
  }
}

// 处理 element
function processElement(vnode, container) {
  // init
  // update
  mountElement(vnode, container);
}

function mountElement(vnode, container) {
  const { type, props, children } = vnode;
  const el = (vnode.el = document.createElement(type));
  if (typeof children === "string") {
    el.textContent = children;
  } else if (isArray(children)) {
    mountChildren(vnode, el);
  }
  for (const key in props) {
    el.setAttribute(key, props[key]);
  }
  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach(child => {
    patch(child, container);
  });
}

// 处理component
function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

function mountComponent(initialVnode, container) {
  const instance = createComponentInstance(initialVnode);

  setupComponent(instance);
  setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance, initialVnode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  // initialVnode -> patch
  // initialVnode -> element -> mount

  patch(subTree, container);

  //  所有的element都已经渲染完成
  initialVnode.el = subTree.el;
}
