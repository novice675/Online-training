<template>
    <div class="dashboard-container">
        <!-- 基础用法 -->
        <div v-watermark>默认水印</div>

        <!-- 自定义水印 -->
        <div v-watermark="{
            text: '张三爱上李四',
            fontSize: 20,
            color: '#ff0000',
            rotate: -45,
            opacity: 0.2
        }" style="width:500px;height:200px">自定义水印</div>

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

        <div class="data-container">
            <div class="data-header">
                <h2>数据列表</h2>
                <el-input v-model="searchQuery" placeholder="搜索数据..." class="search-input" clearable>
                    <template #prefix>
                        <el-icon>
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
            </div>

            <div class="virtual-list-container">
                <VirtuaList :list="filteredList" ref="virtualListRef" class="virtual-list"></VirtuaList>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import html2canvas from 'html2canvas';
import VirtuaList from '../components/VirtuaList.vue';
import { jsPDF } from "jspdf";
import { Plus, Edit, Delete, Picture, Document, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 模拟数据生成
const generateData = () => {
    return new Array(100000).fill(0).map((_, index) => ({
        id: index + 1,
        name: `数据项 ${index + 1}`,
        description: `这是第 ${index + 1} 条数据的详细描述`,
        status: index % 3 === 0 ? '活跃' : index % 3 === 1 ? '待处理' : '已完成',
        createTime: new Date(Date.now() - index * 1000 * 60 * 60).toLocaleString()
    }));
};

const arr = generateData();
const isShow = ref(false);
const virtualListRef = ref<InstanceType<typeof VirtuaList> | null>(null);
const searchQuery = ref('');

// 过滤数据
const filteredList = computed(() => {
    if (!searchQuery.value) return arr;
    const query = searchQuery.value.toLowerCase();
    return arr.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
    );
});


// 导出图片
const exportImage = () => {
    isShow.value = true;
    const renderDom = virtualListRef?.value?.$el;
    html2canvas(renderDom, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const img = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = img;
        a.download = `数据列表_${new Date().toLocaleDateString()}.png`;
        const event = new MouseEvent('click');
        a.dispatchEvent(event);
        ElMessage.success('图片导出成功');
    });
};

// 导出PDF
const exportPdf = () => {
    const renderDom = virtualListRef?.value?.$el;
    html2canvas(renderDom, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4纸的宽度
        const imgHeight = canvas.height * imgWidth / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`数据列表_${new Date().toLocaleDateString()}.pdf`);
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
</style>