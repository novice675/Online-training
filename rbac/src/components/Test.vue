<script setup lang="ts">

/***
 1. vue2 [选项式API] ,vue3  [选项式API,组合式api] 
 2. 组合式api 入口是 --> setup函数（props，context）  --> 没有this 
 3.vue3 setup语法糖 --相当于 -- 
 4. 响应式数据 ，函数 ，计算属性， 监听器 ，属性
 5. defineProps 给组件在语法糖里面声明属性  defineEmits   获取emit 对象， 触发自定义事件
 6 defineProps ,defineEmits  编译期的宏函数，并不是运行在浏览器里面的，不需要导入，可以直接使用


 7.vue 里面 指令就是用来封装dom 操作
 8.vue指令 -  v-开头的特殊属性 
 9 vue指令分类 - 全局指令【所有组件】， 局部指令【当前定义的组件使用】
 10. vue2和vue3 指令的声明周期
 11 .vue2 指令那些声明周期函数？  bind inserted  update componetUpdated ,unbind
     vue3 和组件的声明周期保持一致

 12.虚拟列表 
  - 解决什么问题： 大量数据渲染，导致页面卡顿
  - 如何解决的： 

*/

import { ref } from 'vue'

//ts 泛型
type  CProps ={ msg: string,a?:number }; //组件props 的类型
defineProps<CProps>();


const count = ref(0)
</script>

<template>
   {{ msg }}
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
