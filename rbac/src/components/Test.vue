<script setup lang="ts">

/***
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
