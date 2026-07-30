import {WikiCard} from "./WikiCard";
export default function Introduction() {
    return (
      <div className="flex gap-2 justify-between ">
      <WikiCard className="w-[400px] flex-1">
        <h1 className="font-bold text-2xl">前端</h1>
        <p className="text-sm">
        前端是创建网页或网络应用程序图形用户界面的技术领域，负责实现用户直接看到并与之交互的部分。其基础由三种核心技术构成：超文本标记语言（HTML）定义内容和结构，层叠样式表（CSS）控制视觉表现与布局，JavaScript 处理交互逻辑与动态行为。前端开发起源于 1990 年代初的静态超文本页面，随着 CSS 和 JavaScript 的引入逐步获得表现力与交互能力，并在 AJAX 技术推动下进入富互联网应用时代。现代前端已发展为高度工程化的学科，普遍采用组件化架构、单页应用（SPA）和渐进式网页应用（PWA）等模式，辅以 React、Vue.js、Angular 等框架及构建工具链。除实现界面功能外，前端工程师还需考虑跨浏览器兼容性、响应式设计、性能优化、无障碍访问（a11y）与搜索引擎优化（SEO）等问题，其工作与用户体验、设计系统及后端服务紧密协作，是万维网生态中不可或缺的一环。
        </p>
      </WikiCard>
       <WikiCard className="w-[400px] flex-1">
        <h1 className="font-bold text-2xl">Javascript</h1>
        <p className="text-sm">JavaScript（简称 JS）是一种高级、解释型、多范式的编程语言，由网景公司的布兰登·艾克于 1995 年创造，最初命名为 LiveScript，后更改为现名。其语法标准由 Ecma 国际的 TC39 委员会维护，称为 ECMAScript。JavaScript 具备动态类型、基于原型的对象模型和一等函数，支持事件驱动、函数式、面向对象及指令式编程风格。
          作为万维网的核心技术之一，它与 HTML 和 CSS 共同构成现代网页的基石，能够在浏览器中实现复杂的用户交互、动画、异步数据通信以及完整的客户端应用。随着 Node.js 等运行环境的出现，JavaScript 突破了浏览器限制，广泛用于服务器端开发和命令行工具。借助 React Native、Electron 等框架，该语言还可延伸至移动应用与桌面应用开发。主流 JavaScript 引擎（如 Chrome 的 V8）采用即时编译（JIT）技术显著提升了执行效率。语言本身亦在持续演进，自 ECMAScript 2015（ES6）以来相继引入类、模块、箭头函数、Promise 和 async/await 等特性，日益适应大规模应用程序的构建。</p>
      </WikiCard>
      </div>
    )
}