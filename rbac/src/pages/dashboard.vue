<template>
    <div class="dashboard-container">
        <div class="action-bar">
            <el-button type="primary" v-auth="`create`" @click="handleAdd">
                <el-icon>
                    <Plus />
                </el-icon>添加
            </el-button>
            <el-button type="warning" v-auth="`update`" @click="handleEdit">
                <el-icon>
                    <Edit />
                </el-icon>修改
            </el-button>
            <el-button type="danger" v-auth="'delete'" @click="handleDelete">
                <el-icon>
                    <Delete />
                </el-icon>删除
            </el-button>
            <el-button type="success" @click="exportImage">
                <el-icon>
                    <Picture />
                </el-icon>导出图片
            </el-button>
            <el-button type="info" @click="exportPdf">
                <el-icon>
                    <Document />
                </el-icon>导出PDF
            </el-button>
        </div>

        <div class="data-container" v-watermark="options">
            <div class="data-header">
                <h2>数据列表</h2>
                <!-- 移除搜索输入框 -->
            </div>

            <div class="virtual-list-container">
                <VirtuaList :list="mockList" ref="virtualListRef" class="virtual-list"></VirtuaList>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import VirtuaList from '../components/VirtuaList.vue';
import { Plus, Edit, Delete, Picture, Document, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { WatermarkOptions } from '../types/interfaces/watermark';
import { mockList } from '../mock/index'

const options: WatermarkOptions = {
    text: '演示水印',
    fontSize: 18,
    color: '#888',
    opacity: 0.15,
    rotate: -20
};

// 删除 generateData、arr、searchQuery、filteredList 相关逻辑

const isShow = ref(false);
const virtualListRef = ref<InstanceType<typeof VirtuaList> | null>(null);

// 导出图片
const exportImage = () => {
    isShow.value = true; // 标记导出操作，可能用于后续扩展
    // 获取需要导出的DOM节点（虚拟列表组件的根元素）
    const renderDom = virtualListRef?.value?.$el;
    // 使用html2canvas将DOM节点渲染为canvas
    html2canvas(renderDom, {
        scale: 2, // 提高分辨率，保证图片清晰
        useCORS: true, // 允许跨域图片渲染
        backgroundColor: '#ffffff' // 设置背景为白色
    }).then(canvas => {
        // 将canvas内容转为图片base64数据
        const img = canvas.toDataURL('image/png');
        // 创建一个a标签用于下载图片
        const a = document.createElement('a');
        a.href = img;
        a.download = `数据列表_${new Date().toLocaleDateString()}.png`;
        // 创建并触发点击事件，自动下载图片
        const event = new MouseEvent('click');
        a.dispatchEvent(event);
        // 提示用户导出成功
        ElMessage.success('图片导出成功');
    });
};

// 导出PDF
const exportPdf = () => {
    // 获取需要导出的DOM节点（虚拟列表组件的根元素）
    const renderDom = virtualListRef?.value?.$el;
    // 先用html2canvas将DOM渲染为图片
    html2canvas(renderDom, {
        scale: 2, // 提高分辨率，保证PDF清晰
        useCORS: true, // 允许跨域图片渲染
        backgroundColor: '#ffffff' // 设置背景为白色
    }).then(canvas => {
        // 将canvas内容转为图片base64数据
        const imgData = canvas.toDataURL('image/png');
        // 创建jsPDF实例，A4纸，单位mm
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4纸宽度（mm）
        // 按比例计算图片高度，保证不变形
        const imgHeight = canvas.height * imgWidth / canvas.width;
        // 添加图片到PDF
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        // 保存PDF文件
        pdf.save(`数据列表_${new Date().toLocaleDateString()}.pdf`);
        // 提示用户导出成功
        ElMessage.success('PDF导出成功');
    });
};

// 操作处理函数
const handleAdd = () => {
    ElMessage.info('添加功能待实现');
};

const handleEdit = () => {
    ElMessage.info('修改功能待实现');
};

const handleDelete = () => {
    ElMessage.info('删除功能待实现');
};
</script>

<style scoped>
.dashboard-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.action-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.data-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.data-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.data-header h2 {
    margin: 0;
    color: #303133;
    font-size: 20px;
}

.search-input {
    width: 300px;
}

.virtual-list-container {
    height: 600px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: hidden;
}

.virtual-list {
    height: 100%;
}

/* :deep() 选择器的作用是穿透 scoped 样式的限制，使样式能够影响到子组件。修改 Element Plus 组件样式时是必需的 */
/* 按钮样式：使用flex布局，使图标和文字垂直居中对齐，并设置间距 */
:deep(.el-button) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

/* 输入框默认样式：设置浅灰色边框 */
:deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6 inset;
}

/* 输入框悬停样式：边框颜色变深 */
:deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #c0c4cc inset;
}

/* 输入框聚焦样式：边框变为主题蓝色 */
:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #409eff inset;
}

.list-item {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s;
}

.list-item:hover {
  background-color: #f5f7fa;
}

.item-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  word-break: break-all;
}

.item-description {
  font-size: 13px;
  color: #909399;
  white-space: pre-line;
  word-break: break-all;
}

.item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 90px;
}

.item-time {
  font-size: 12px;
  color: #b1b1b1;
}
</style>