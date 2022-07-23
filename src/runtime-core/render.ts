import { isArray } from "../shared/index";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  //处理组件
  // 区分是组件还是element
  const { shapeFlag } = vnode;

  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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
  const { type, props, children, shapeFlag } = vnode;
  const el = (vnode.el = document.createElement(type));
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el);
  }
  for (const key in props) {
    const val = props[key];
    const isEvent = (key: string) => /^on[A-Z]/.test(key);
    if (isEvent(key)) {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, val);
    } else {
      el.setAttribute(key, val);
    }
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
