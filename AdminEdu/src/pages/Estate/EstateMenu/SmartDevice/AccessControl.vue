<template>
  <div class="access-control-container">
    <!-- 标题栏 -->
    <div class="header-area">
      <div class="title">
        <div class="title-bar"></div>
        <h2>智能门禁设备</h2>
      </div>
      <div class="action-buttons">
        <el-button type="danger" @click="addDel" :disabled="multipleSelection.length === 0" :icon="Delete">
          批量删除 ({{ multipleSelection.length }})
        </el-button>
        <el-button type="success" @click="refFn" :icon="Refresh">刷新</el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="设备名称：">
          <el-input v-model="searchForm.name" placeholder="请输入设备名称" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="设备编号：">
          <el-input v-model="searchForm.bianhao" placeholder="请输入设备编号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="运行状态：">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="正常" value="正常" />
            <el-option label="离线" value="离线" />
            <el-option label="报警" value="报警" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进人：">
          <el-input v-model="searchForm.Person" placeholder="请输入跟进人" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="showFn" :icon="Search">查询</el-button>
          <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-area">
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading"
        @selection-change="handleSelectionChange" :row-style="{ height: '60px' }"
        :header-row-style="{ height: '50px' }" :header-cell-style="{ backgroundColor: '#f8f9fa', color: '#495057' }">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" label="设备名称" width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="bianhao" label="设备编号" width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="menModel" label="设备型号" width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="status" label="运行状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="dark">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Person" label="跟进人" width="95" align="center" show-overflow-tooltip />
        <el-table-column prop="plone" label="联系方式" width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="location" label="安装位置" width="140" align="center" show-overflow-tooltip />
        <el-table-column prop="operationTime" label="运行时间" width="110" align="center">
          <template #default="{ row }">
            {{ formatDateOnly(row.operationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons-cell">
              <el-button size="small" type="primary" @click="aloneFn(row)" plain>
                查看
              </el-button>
              <el-button size="small" type="warning" @click="EditFn(row)" plain>
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="delFn(row)" plain>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-area">
      <div class="pagination-info">
        <span>共 {{ total }} 条记录，当前第 {{ page }} 页</span>
      </div>
      <el-pagination :current-page="page" :page-size="size" :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" background />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @close="resetForm"
      :close-on-click-modal="false" draggable>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="device-form">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入设备名称" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号" prop="bianhao">
              <el-input v-model="formData.bianhao" placeholder="请输入设备编号" maxlength="30" show-word-limit>
                <template #append>
                  <el-button @click="generateNumber" size="small">
                    自动生成
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="设备型号" prop="menModel">
              <el-select v-model="formData.menModel" placeholder="请选择设备型号" style="width: 100%">
                <el-option v-for="model in deviceModelOptions" :key="model" :label="model" :value="model" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运行状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择运行状态" style="width: 100%">
                <el-option label="正常" value="正常" />
                <el-option label="离线" value="离线" />
                <el-option label="报警" value="报警" />
                <el-option label="禁用" value="禁用" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="跟进人" prop="Person">
              <el-input v-model="formData.Person" placeholder="请输入跟进人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="plone">
              <el-input v-model="formData.plone" placeholder="请输入联系方式" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入安装位置" maxlength="100" show-word-limit />
        </el-form-item>

        <el-divider content-position="left">图片信息</el-divider>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="现场图片" prop="Image">
              <el-input v-model="formData.Image" placeholder="请输入现场图片URL" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备图片" prop="imgs">
              <el-input v-model="formData.imgs" placeholder="请输入设备图片URL" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" size="default">取消</el-button>
          <el-button type="primary" @click="submitFn" :loading="submitLoading" size="default">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="设备详情" width="800px" draggable>
      <div class="device-detail">
        <el-descriptions :column="2" border size="default">
          <el-descriptions-item label="设备名称" label-align="right">
            {{ aloneData.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="设备编号" label-align="right">
            {{ aloneData.bianhao || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="设备型号" label-align="right">
            {{ aloneData.menModel || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="运行状态" label-align="right">
            <el-tag :type="getStatusType(aloneData.status)" size="default" effect="dark">
              {{ aloneData.status || '-' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="跟进人" label-align="right">
            {{ aloneData.Person || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="联系方式" label-align="right">
            {{ aloneData.plone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="安装位置" :span="2" label-align="right">
            {{ aloneData.location || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" label-align="right">
            {{ formatDate(aloneData.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" label-align="right">
            {{ formatDate(aloneData.updateTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="aloneData.Image || aloneData.imgs" class="image-section">
          <el-divider content-position="left">相关图片</el-divider>
          <div class="image-gallery">
            <div v-if="aloneData.Image" class="image-item">
              <div class="image-title">现场图片</div>
              <el-image :src="aloneData.Image" style="width: 250px; height: 180px" fit="cover"
                :preview-src-list="[aloneData.Image]" :preview-teleported="true" />
            </div>
            <div v-if="aloneData.imgs" class="image-item">
              <div class="image-title">设备图片</div>
              <el-image :src="aloneData.imgs" style="width: 250px; height: 180px" fit="cover"
                :preview-src-list="[aloneData.imgs]" :preview-teleported="true" />
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Delete,
  Refresh,
  Search
} from "@element-plus/icons-vue";
import {
  MenjinList,
  MenjinDetail,
  addMenjin,
  upMenjin,
  delMenjin,
  allDelMenjin,
} from "@/api/auth";

// 类型定义
interface DeviceData {
  _id: string;
  name: string;
  bianhao: string;
  menModel: string;
  status: "正常" | "离线" | "报警" | "禁用";
  Person: string;
  plone: string;
  location: string;
  Image: string;
  imgs: string;
  createTime: string;
  updateTime: string;
  operationTime?: string;
}

interface SearchForm {
  name: string;
  bianhao: string;
  status: string;
  Person: string;
}

interface FormData {
  name: string;
  bianhao: string;
  menModel: string;
  status: "正常" | "离线" | "报警" | "禁用";
  Person: string;
  plone: string;
  location: string;
  Image: string;
  imgs: string;
}

interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg?: string;
  total?: number;
  deletedCount?: number;
}

// 状态类型映射
type StatusType = "success" | "info" | "danger" | "warning";
const statusTypeMap: Record<string, StatusType> = {
  正常: "success",
  离线: "info",
  报警: "danger",
  禁用: "warning",
};

// 响应式数据
const loading = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const tableData = ref<DeviceData[]>([]);
const multipleSelection = ref<DeviceData[]>([]);
const page = ref<number>(1);
const size = ref<number>(10);
const total = ref<number>(0);

// 路由
const router = useRouter();

// 搜索表单
const searchForm = reactive<SearchForm>({
  name: "",
  bianhao: "",
  status: "",
  Person: "",
});

// 对话框状态
const dialogVisible = ref<boolean>(false);
const viewDialogVisible = ref<boolean>(false);
const isEdit = ref<boolean>(false);
const Ids = ref<string>("");

// 表单数据
const formData = reactive<FormData>({
  name: "",
  bianhao: "",
  menModel: "",
  status: "正常",
  Person: "",
  plone: "",
  location: "",
  Image: "",
  imgs: "",
});

const aloneData = ref<DeviceData>({} as DeviceData);
const formRef = ref<any>();

// 设备型号选项
const deviceModelOptions = [
  'TC-GATE-2024',
  'TC-FACE-2024',
  'TC-CARD-2024',
  'TC-FINGER-2024',
  'TC-QR-2024',
  'TC-SMART-2024'
];

// 生成默认设备编号
const generateDeviceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MJ${year}${month}${day}${random}`;
};

// 生成编号按钮事件
const generateNumber = () => {
  formData.bianhao = generateDeviceNumber();
};

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  bianhao: [{ required: true, message: "请输入设备编号", trigger: "blur" }],
  status: [{ required: true, message: "请选择运行状态", trigger: "change" }],
  menModel: [{ required: true, message: "请选择设备型号", trigger: "change" }],
};

// 计算属性
const dialogTitle = computed(() => {
  return isEdit.value ? "编辑设备" : "新增设备";
});

// 获取状态标签类型
const getStatusType = (status: string): StatusType => {
  return statusTypeMap[status] || "info";
};

// 格式化日期时间
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("zh-CN");
};

// 格式化日期
const formatDateOnly = (dateStr: string): string => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("zh-CN");
};

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      size: size.value,
      ...searchForm
    };

    const res: { data: ApiResponse<DeviceData[]> } = await MenjinList(params);
    if (res.data.code === 200) {
      tableData.value = res.data.data;
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.data.msg || "获取数据失败");
    }
  } catch (error) {
    ElMessage.error("获取数据失败");
  } finally {
    loading.value = false;
  }
};

// 查询
const showFn = () => {
  page.value = 1;
  fetchData();
};

// 重置搜索
const resetSearch = () => {
  (Object.keys(searchForm) as Array<keyof SearchForm>).forEach((key) => {
    searchForm[key] = "";
  });
  showFn();
};

// 刷新数据
const refFn = () => {
  fetchData();
  ElMessage.success("数据已刷新");
};

// 分页大小改变
const handleSizeChange = (val: number) => {
  size.value = val;
  page.value = 1;
  fetchData();
};

// 当前页改变
const handleCurrentChange = (val: number) => {
  page.value = val;
  fetchData();
};

// 选择改变
const handleSelectionChange = (val: DeviceData[]) => {
  multipleSelection.value = val;
};

// 新增设备
const add = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 查看详情
const aloneFn = async (row: DeviceData) => {
  try {
    const res: { data: ApiResponse<DeviceData> } = await MenjinDetail(row._id);
    if (res.data.code === 200) {
      aloneData.value = res.data.data;
      viewDialogVisible.value = true;
    } else {
      ElMessage.error(res.data.msg || "获取设备详情失败");
    }
  } catch (error) {
    ElMessage.error("获取设备详情失败");
  }
};

// 编辑设备
const EditFn = async (row: DeviceData) => {
  isEdit.value = true;
  Ids.value = row._id;

  try {
    const res: { data: ApiResponse<DeviceData> } = await MenjinDetail(row._id);
    if (res.data.code === 200) {
      const data = res.data.data;
      (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
        if (key in data) {
          (formData as any)[key] = data[key] || "";
        }
      });
      dialogVisible.value = true;
    } else {
      ElMessage.error(res.data.msg || "获取设备详情失败");
    }
  } catch (error) {
    ElMessage.error("获取设备详情失败");
  }
};

// 删除设备
const delFn = (row: DeviceData) => {
  ElMessageBox.confirm(`确定要删除设备"${row.name}"吗？`, "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res: { data: ApiResponse } = await delMenjin(row._id);
      if (res.data.code === 200) {
        ElMessage.success("删除成功");
        fetchData();
      } else {
        ElMessage.error(res.data.msg || "删除失败");
      }
    } catch (error) {
      ElMessage.error("删除失败");
    }
  });
};

// 批量删除
const addDel = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning("请选择要删除的设备");
    return;
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${multipleSelection.value.length} 个设备吗？`,
    "确认批量删除",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(async () => {
    try {
      const ids = multipleSelection.value.map((item) => item._id);
      const res: { data: ApiResponse } = await allDelMenjin(ids);
      if (res.data.code === 200) {
        ElMessage.success(`成功删除 ${res.data.deletedCount || ids.length} 个设备`);
        fetchData();
      } else {
        ElMessage.error(res.data.msg || "批量删除失败");
      }
    } catch (error) {
      ElMessage.error("批量删除失败");
    }
  });
};

// 提交表单
const submitFn = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true;
      try {
        let res: { data: ApiResponse };
        if (isEdit.value) {
          res = await upMenjin(Ids.value, formData);
        } else {
          res = await addMenjin(formData);
        }

        if (res.data.code === 200) {
          ElMessage.success(isEdit.value ? "修改成功" : "新增成功");
          dialogVisible.value = false;
          fetchData();
        } else {
          ElMessage.error(res.data.msg || "操作失败");
        }
      } catch (error) {
        ElMessage.error("操作失败");
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
    if (key === "status") {
      formData[key] = "正常";
    } else {
      (formData as any)[key] = "";
    }
  });
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 初始化
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.access-control-container {
  padding: 24px;
  background-color: #f5f7fa;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-bar {
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #4080ff, #1890ff);
  border-radius: 2px;
}

.title h2 {
  font-size: 20px;
  margin: 0;
  font-weight: 600;
  color: #1f2937;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.search-area {
  background: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  flex-shrink: 0;
}

.search-form {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  align-items: center;
}

.search-form .el-form-item {
  margin-bottom: 0;
  margin-right: 0;
}

.table-area {
  background: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.pagination-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 20px 24px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.action-buttons-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* Element Plus 组件样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f8fafc !important;
  color: #374151 !important;
  font-weight: 600;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f1f5f9;
}

:deep(.el-table__row:hover) {
  background-color: #f8fafc;
}

:deep(.el-pagination) {
  --el-pagination-font-size: 14px;
}

/* 设备表单样式 */
.device-form {
  padding: 8px 0;
}

.device-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.device-form :deep(.el-input__wrapper) {
  border-radius: 6px;
}

.device-form :deep(.el-select .el-input__wrapper) {
  border-radius: 6px;
}

.device-form :deep(.el-textarea__inner) {
  border-radius: 6px;
}

/* 设备详情样式 */
.device-detail {
  padding: 8px 0;
}

.device-detail :deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
  width: 120px;
}

.device-detail :deep(.el-descriptions__content) {
  color: #303133;
}

/* 图片部分样式 */
.image-section {
  margin-top: 24px;
  padding: 20px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.image-gallery {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.image-item {
  text-align: center;
}

.image-title {
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.image-item :deep(.el-image) {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-item :deep(.el-image:hover) {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .access-control-container {
    padding: 16px;
  }

  .header-area {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .pagination-area {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .image-gallery {
    justify-content: center;
  }
}

@media (max-width: 1400px) {
  .search-form {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }

  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 16px;
    width: 100%;
  }

  .search-form .el-form-item .el-input,
  .search-form .el-form-item .el-select {
    width: 100% !important;
  }

  .action-buttons-cell {
    flex-direction: column;
    gap: 4px;
  }

  .image-gallery {
    flex-direction: column;
    align-items: center;
  }
}


</style>