# 从 AnyScript 到 TypeScript

[TOC]

## 聊聊 TypeScript

TypeScript 是微软主导开发实现的一种编程语言，号称是 JavaScript 的超集并且兼容 JavaScript。

主要特点：

- TypeScript 是一种静态类型的编程语言
  - TypeScript 可以编译为比较干净的 JavaScript 代码（人类可读）
- 有好用的工具链
  - VSCode
  - TypeScript Language Server
- TypeScript 是一种编译到 JavaScript 的编程语言。**目前没有针对 TypeScript 专门设计的运行时**
  - 透过 JavaScript 运行时，TypeScript 也可以运行在所有支持 JavaScript 的环境中

**TypeScript 为 JavaScript 生态引入一套可以广泛接受的类型系统**。

## 聊聊 AnyScript

在 JavaScript 一个变量可以存入任意类型的数据：

```js
let someVar;
someVar = 1; // OK
someVar = null; // OK
someVar = undefined; // OK
someVar = {}; // OK
```

在 TypeScript 中，用 `any` 类型表示。

TypeScript 通过引入 any 类型，实现对 JavaScript 的这种使用场景的兼容。随着程序员“发扬光大”，很快代码库中充斥各种 any 变量，最终演进为 AnyScript。

## 为什么会出现 AnyScript？

我总结出下面几点：

### 1. TypeScript 开发“慢”

软件开发本质就是一个建模的过程，业务模型最终会以类、组件、对象等形式落地。但前端开发很多不具备这一能力。用 TypeScript 编码，需要前端更深入理解业务。

### 2. 维护类型有“巨大”的工作量

在快速演进过程中，类型标错误，缺少字段非常常见。维护类型，需要额外的工作。

> 为什么维护类型是额外的工作量？
>
> 目前流行的 Web 应用构建工具 Vite 举例，其内部使用 esbuild 处理 TypeScript 代码。esbuild 使用类型擦除方式处理 TypeScript 类型。TypeScript 类型声明在运行时没有任务作用。

### 3. 写出正确的类型并不是一件容易事

书写正确的类型，这需要看文档。

![](/images/no-doc.png)

看一个比较简单的 Vue 组件例子：

```ts
export type Component<
  Props = any,
  RawBindings = any,
  D = any,
  C extends ComputedOptions = ComputedOptions,
  M extends MethodOptions = MethodOptions,
  E extends EmitsOptions | Record<string, any[]> = {},
  S extends Record<string, any> = any,
> = ConcreteComponent<Props, RawBindings, D, C, M, E, S> | ComponentPublicInstanceConstructor<Props>;
```

可能看了文档也不一定写得出来。当然面对特定的业务场景，编写足够清楚的类型声明，相对比较容易办到。

## 实用的 TypeScript

TypeScript 包含非常多的特性。TypeScript 的类型系统甚至是图灵完备。知道下面这些特性已经应对日常工作。

### 原始类型

- `string`
- `boolean`
- `number`
- `symbol`
- `bigint`
- `null`
- `undefined`

这部分和 JavaScript 几乎一一对应。

### interface

**TypeScript 中最核心的类型**

在 TypeScript 使用 interface 来定义对象的类型。TypeScript 中的 interface 可以对类的一部分进行描述，也可以对对象的形状进行描述。

interface 所表达的含意更像 duck typing:

> “当看到一只鸟走起来像鸭子、游泳起来像鸭子、叫起来也像鸭子，那么这只鸟就可以被称为鸭子。”[1](https://zh.wikipedia.org/wiki/%E9%B8%AD%E5%AD%90%E7%B1%BB%E5%9E%8B)

```ts
interface Person {
  name: string;
  age: number;
  familyName?: string; // 支持可选字段
}

let tom: Person = {
  name: 'Tom',
  age: 25,
};
```

只要包含有 name、age 字段的对象，都满足 Person 类型：

```ts
let b = {
  name: 'Jim',
  age: 12,
};

class MarsPerson {
  name: string = 'M';
  age: number = 1;
}

const mars: Person = new MarsPerson(); // 注意，这里没有强制类型转换
```

### Record 辅助类型

interface 支持声明索引：

```ts
interface MyRecord {
  [field: string]: string;
}

let myRecord: MyRecord;
```

通过内置的 Record 类型，可以简化上面的声明：

```ts
let myRecord: Record<string, string>;
```

### 字符串字面量类型

字符串字面量类型用来约束取值只能是某几个字符串中的一个。

```ts
type EventNames = 'click' | 'scroll' | 'mousemove';
```

在声明类型，VSCode 的自动完成提示会显示出所有可选的值：

![字符串字面量类型](/images/literal-string-type.png)

### enum

TypeScript 支持声明值是字符串 enum 类型。比如上面的 EventNames 也可以改写为 enum：

```ts
enum EventTypeEnum {
  mouseup = 'mouseup',
  mousedown = 'mousedown',
  mousemove = 'mousemove',
}
```

### enum vs 字符串字面量类型

**enum 会同时编译为对象和 TypeScript 类型**：

```js
// EventTypeEnum 将编译为这段 JavaScript 代码
'use strict';
var EventTypeEnum;
(function (EventTypeEnum) {
  EventTypeEnum['mouseup'] = 'mouseup';
  EventTypeEnum['mousedown'] = 'mousedown';
  EventTypeEnum['mousemove'] = 'mousemove';
})(EventTypeEnum || (EventTypeEnum = {}));
```

![](/images/compile-ts-to-js.png)

字符串字面量类型只编译为类型声明，不会产生 JavaScript 代码。字符串字面量类型更轻量，也产生更少的代码。

### 函数类型

箭头函数类型：

```ts
type ShowName = (p: Person, format = '') => void;
```

也可以使用 function 关键字：

```ts
function ShowName(p: Person，format = ""): void;
```

## 实战：Vue 和 TypeScript

Vue 对于 TypeScript 已经有比较好的支持。

> 如果你还在用 Vue2，请尽快（马上）升级到 Vue3。Vue2 已经 EOM。

Vue 结合 TypeScript，目前最舒服方式是使用 TSX+Composition API。著名的 devui-vue 也采用 TSX+Composition API 的写法。

使用这种写法，你可以收获：

1. 更稳定的自动完成提示
2. 更好的类型检查
3. 额外收获：更容易编写小组件
4. 额外收获：对 Vue 更深入的理解

### TSX+Composition API 案例

> Vite 需要配置 `@vitejs/plugin-vue-jsx` 插件

```tsx
import type { Graph } from '@antv/x6';
import { defineComponent, onBeforeUnmount, onMounted, ref, type PropType } from 'vue';
import { initX6, type FlowchartDrawPlugin } from './init';
import { useCustomShapes } from './shapes';

import './style.css';

export default defineComponent({
  props: {
    tools: {
      type: Array as PropType<FlowchartDrawPlugin[]>,
      default() {
        return [];
      },
    },
  },
  setup(props, { slots, expose }) {
    useCustomShapes();

    const graphContainer = ref<HTMLDivElement>();
    let GI: InstanceType<typeof Graph> | null = null;
    function cleanX6() {
      GI?.off();
      GI?.dispose();
      GI = null;
    }

    async function setupX6() {
      if (!graphContainer.value) {
        throw new Error('require x6 container');
      }

      if (GI !== null) {
        cleanX6();
      }

      GI = initX6(graphContainer.value);
      for (const addTool of props.tools) {
        if (GI) {
          await addTool(GI);
        }
      }
    }

    onMounted(() => {
      setupX6();
    });

    onBeforeUnmount(() => {
      cleanX6();
    });

    function getGraphInstance() {
      return GI;
    }

    expose({ getGraphInstance });

    return () => {
      return (
        <div class="flowchart-draw">
          <div ref={graphContainer} class="fd-board">
            {/* x6 mount point */}
          </div>
          <div class="fd-tl-toolbar">{slots.tlToolbar?.() || <span>tl</span>}</div>
          <div class="fd-tr-toolbar">{slots.trToolbar?.() || <span>tr</span>}</div>
          <div class="fd-bl-toolbar">{slots.blToolbar?.() || <span>bl</span>}</div>
          <div class="fd-br-toolbar">{slots.brToolbar?.() || <span>br</span>}</div>
        </div>
      );
    };
  },
});
```

### Hook + TSX

结合 Hook 的手法，可以实现一种更有趣的组件：

```ts
// use-label.tsx
import { defineComponent, ref } from 'vue';

export function useLabel() {
  const label = ref('');

  const Comp = defineComponent({
    setup() {
      return () => <h>{label.value}</h>;
    },
  });

  return {
    MyLabel: Comp,
    label,
  };
}
```

```html
<script setup>
  // App.vue
  import { onMounted } from 'vue';
  import { useLabel } from './use-label.tsx';

  const { MyLabel, label } = useLabel();

  onMounted(() => {
    label.value = 'hello';
    setTimeout(() => {
      label.value = 'hello, world';
    }, 1000);
  });
</script>

<template>
  <MyLabel />
</template>
```

## 小结

套用用 [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) 的理念，项目的组件分为几类：

![](/images/atomic-design.png)

| 分类   | 功能                                                                                   | 适合 TypeScript |
| ------ | -------------------------------------------------------------------------------------- | --------------- |
| 原子   | 基础组件，比如按钮之类，一般使用三方库或二方库（Element-Plus、devui 之类）             | ✔️              |
| 分子   | 由基础组件简单整合出来的，具有特定功能组件。比如用户选择，一般由 Select + 接口包装出来 | ✔️              |
| 有机物 | 如何用整个页面角度来考虑，“有机物”实现了部分页面功能。比如导航                         | 😀              |
| 模板   | 模板已经具有一个页面的功能，更类似页面的骨架，填上数据就是一个页面                     | 😀              |
| 页面   | 由多个模板页面组成，直接承载业务落地                                                   | 😀              |
