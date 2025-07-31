<template>
  <div class="container">
      <div class="menu" :class="{ 'collapse': isCollapse }">
          <Menu />
      </div>
      <div class="content">
          <RouterView v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                  <component :is="Component" />
              </transition>
          </RouterView>
      </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Menu from '@/components/Menu.vue'
import { RouterView } from 'vue-router'
const isCollapse = ref(false)
</script>

<style scoped>
.container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  overflow: hidden;
}

.menu {
  width: 240px;
  background-color: #304156;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  transition: all 0.3s ease-in-out;
  z-index: 1000;
  position: relative;
  overflow-x: hidden;
}

.menu.collapse {
  width: 64px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  position: relative;
  min-width: 0;
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Element Plus 组件样式 */
:deep(.el-icon) {
  vertical-align: middle;
}

:deep(.el-scrollbar__wrap),
:deep(.el-table__body-wrapper) {
  overflow-x: hidden !important;
}
</style>