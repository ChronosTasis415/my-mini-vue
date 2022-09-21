import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement,
    patchProps: hostPatchProps,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  // 不再到处render
  function render(vnode, container, parentComponent) {
    patch(null, vnode, container, parentComponent, null);
  }

  function patch(n1, n2, container, parentComponent, anchor) {
    //处理组件
    // 区分是组件还是element
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }
  // 处理text文本节点
  function processText(n1, n2, contianer) {
    // 调用createTextVnode后 text 变成了 h(Text, {}, text) 所以text文本就是children
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    contianer.append(textNode);
  }
  // 处理fragment
  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }
  // 处理 element
  function processElement(n1, n2, container, parentComponent, anchor) {
    // init
    // update
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }
  const EMPTY_OBJ = {};

  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapFlag = n1.shapeFlag;
    const c1 = n1.children;
    const { shapeFlag } = n2;
    const c2 = n2.children;

    // 新的是text
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 老的是array
      if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        console.log("patchChildren");
        // 把老的children清空
        unmountChildren(n1.children);

        // 设置text
        hostSetElementText(container, c2);
      } else {
        // 老的也是text
        if (c1 !== c2) {
          hostSetElementText(container, c2);
        }
      }
    } else {
      // 新的是一个array

      if (prevShapFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // 新旧都是数组
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  // 节点是否一样 type 和 key
  function isSameVNodeType(n1, n2) {
    return n1.key === n2.key && n1.type === n2.type;
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    //1  左侧 旧的 (a b) c 新的(a b) d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }

    //2 右侧
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    //3 新的比老的长
    // (a b)
    // (a b) c
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        // 左侧添加的时候 下一个位置作为insert的点；右侧添加的时候 下一个位置为null 直接append
        // const anchor = i + 1 > l2 ? null : c2[nextPos].el;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;

        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // (a b) c
      // (a b)
      // i=2 e1=2 e2=1
      // 或者
      // c (a b)
      // (a b)
      // i=2 e1=2 e2=1
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 中间对比
      let s1 = i; // 旧的
      let s2 = i; // 新的
      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      let keyToNewIndexMap = new Map();
      // a,b,(c,d,e),f,g
      // a,b,(e,c,d),f,g
      // 括号中间部分为newIndexToOldIndexMap
      let newIndexToOldIndexMap = new Array(toBePatched);
      let moved = false;
      let maxNewIndexSoFar = 0;
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        let newIndex;
        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
        }
        if (prevChild.key !== null) {
          // 旧的key存在
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // 旧的key不存在 遍历新的
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        // 上述操作声明newIndex，查找有的话赋值，没有的话就是undefined
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length;

      for (let i = toBePatched - 1; i > 0; i--) {
        // a,b,(c,d,e),f,g
        // a,b,(e,c,d),f,g
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        }
        if (moved) {
          if (j < 0 || i !== newIndexToOldIndexMap[j]) {
            console.log("移动");
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      //remove
      hostRemove(el);
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];

        if (prevProp !== nextProp) {
          hostPatchProps(el, key, prevProp, nextProp);
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProps(el, key, oldProps[key], null);
          }
        }
      }
    }
  }

  function mountElement(vnode, container, parentComponent, anchor) {
    const { type, props, children, shapeFlag } = vnode;

    const el = (vnode.el = createElement(type));
    // const el = (vnode.el = document.createElement(type));
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
    }
    for (const key in props) {
      const val = props[key];
      hostPatchProps(el, key, null, val);
    }

    hostInsert(el, container);
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(child => {
      patch(null, child, container, parentComponent, anchor);
    });
  }

  // 处理component
  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;

      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  function mountComponent(initialVnode, container, parentComponent, anchor) {
    const instance = (initialVnode.component = createComponentInstance(
      initialVnode,
      parentComponent
    ));

    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container, anchor);
  }

  function setupRenderEffect(instance, initialVnode, container, anchor) {
    // element 更新逻辑
    instance.update = effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));

        // initialVnode -> patch
        // initialVnode -> element -> mount

        patch(null, subTree, container, instance, anchor);

        //  所有的element都已经渲染完成
        initialVnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        console.log("updated");
        // next为修改后的com，vnode为修改前的vnode
        const { next, vnode } = instance;
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next);
        }
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const preSubTree = instance.subTree;
        instance.subTree = subTree;

        patch(preSubTree, subTree, container, instance, anchor);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}

function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode;
  instance.next = null;
  instance.props = nextVNode.props;
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
