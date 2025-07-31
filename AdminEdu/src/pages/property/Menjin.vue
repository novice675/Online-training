<template>
  <div class="menjin-page">
    <TableLayout
      title="智能门禁设备管理"
      :current-page="page"
      :page-size="size"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #actions>
        <el-button type="primary" @click="add">
          <el-icon><Plus /></el-icon>
          新增设备
        </el-button>
        <el-button
          type="danger"
          @click="addDel"
          :disabled="multipleSelection.length === 0"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button type="success" @click="refFn">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </template>

      <template #search>
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="设备名称：">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入设备名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="设备编号：">
            <el-input
              v-model="searchForm.bianhao"
              placeholder="请输入设备编号"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="运行状态：">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择"
              clearable
              style="width: 150px"
            >
              <el-option label="正常" value="正常" />
              <el-option label="离线" value="离线" />
              <el-option label="报警" value="报警" />
              <el-option label="禁用" value="禁用" />
            </el-select>
          </el-form-item>
          <el-form-item label="跟进人：">
            <el-input
              v-model="searchForm.Person"
              placeholder="请输入跟进人"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="showFn">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </template>

      <template #table>
        <el-table
          :data="tableData"
          border
          stripe
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="设备名称" width="150" />
          <el-table-column prop="bianhao" label="设备编号" width="150" />
          <el-table-column prop="menModel" label="设备型号" width="120" />
          <el-table-column prop="status" label="运行状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="Person" label="跟进人" width="100" />
          <el-table-column prop="plone" label="联系方式" width="150" />
          <el-table-column prop="location" label="安装位置" width="150" />
          <el-table-column prop="createTime" label="创建时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="aloneFn(row)">
                查看
              </el-button>
              <el-button size="small" type="warning" @click="EditFn(row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="delFn(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </TableLayout>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号" prop="bianhao">
              <el-input
                v-model="formData.bianhao"
                placeholder="请输入设备编号"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备型号" prop="menModel">
              <el-input
                v-model="formData.menModel"
                placeholder="请输入设备型号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运行状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择运行状态">
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
              <el-input v-model="formData.Person" placeholder="请输入跟进人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="plone">
              <el-input v-model="formData.plone" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-form-item label="现场图片" prop="Image">
          <el-input v-model="formData.Image" placeholder="请输入现场图片URL" />
        </el-form-item>
        <el-form-item label="设备图片" prop="imgs">
          <el-input v-model="formData.imgs" placeholder="请输入设备图片URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitFn"
            :loading="submitLoading"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="设备详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备名称">{{
          aloneData.name
        }}</el-descriptions-item>
        <el-descriptions-item label="设备编号">{{
          aloneData.bianhao
        }}</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{
          aloneData.menModel
        }}</el-descriptions-item>
        <el-descriptions-item label="运行状态">
          <el-tag :type="getStatusType(aloneData.status)" size="small">
            {{ aloneData.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="跟进人">{{
          aloneData.Person
        }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{
          aloneData.plone
        }}</el-descriptions-item>
        <el-descriptions-item label="安装位置" :span="2">{{
          aloneData.location
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatDate(aloneData.createTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{
          formatDate(aloneData.updateTime)
        }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="aloneData.Image || aloneData.imgs" class="image-section">
        <h4>相关图片</h4>
        <div class="image-gallery">
          <div v-if="aloneData.Image" class="image-item">
            <p>现场图片：</p>
            <el-image
              :src="aloneData.Image"
              style="width: 200px; height: 150px"
              fit="cover"
              :preview-src-list="[aloneData.Image]"
            />
          </div>
          <div v-if="aloneData.imgs" class="image-item">
            <p>设备图片：</p>
            <el-image
              :src="aloneData.imgs"
              style="width: 200px; height: 150px"
              fit="cover"
              :preview-src-list="[aloneData.imgs]"
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Delete, Refresh, Search } from "@element-plus/icons-vue";
import TableLayout from "@/components/TableLayout.vue";
import {
  MenjinList,
  MenjinDetail,
  addMenjin,
  upMenjin,
  delMenjin,
  allDelMenjin,
} from "../../api/auth";

interface alonefrom {
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
}

interface showfrom {
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

const loading = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const tableData = ref<alonefrom[]>([]);
const multipleSelection = ref<alonefrom[]>([]);
const page = ref<number>(1);
const size = ref<number>(10);
const total = ref<number>(0);

const searchForm = reactive<showfrom>({
  name: "",
  bianhao: "",
  status: "",
  Person: "",
});

const dialogVisible = ref<boolean>(false);
const viewDialogVisible = ref<boolean>(false);
const isEdit = ref<boolean>(false);
const Ids = ref<string>("");

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

const aloneData = ref<any>({});

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
const generateDeviceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MJ${year}${month}${day}${random}`;
};

const rules = {
  name: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  bianhao: [{ required: true, message: "请输入设备编号", trigger: "blur" }],
  status: [{ required: true, message: "请选择运行状态", trigger: "change" }],
};

const dialogTitle = computed(() => {
  return isEdit.value ? "编辑设备" : "新增设备";
});

const getStatusType = (status: string) => {
  const typeMap = {
    正常: "success",
    离线: "info",
    报警: "danger",
    禁用: "warning",
  };
  return typeMap[status] || "info";
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("zh-CN");
};

const fetchData = async () => {
  loading.value = true;
    // 构建查询参数
    const params = {
      page: page.value,
      size: size.value,
      ...searchForm
    };

    const res = await MenjinList(params);
    if (res.data.code === 200) {
      tableData.value = res.data.data
      total.value = res.data.total
    } else {
      ElMessage.error(res.data.msg || "获取数据失败");
    }
    loading.value = false;
};

const showFn = () => {
  page.value = 1;
  fetchData();
};

const resetSearch = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = "";
  });
  showFn();
};

const refFn = () => {
  fetchData();
  ElMessage.success("数据已刷新");
};

const handleSizeChange = (val: number) => {
  size.value = val;
  page.value = 1;
  fetchData(); // 重新获取数据
};

const handleCurrentChange = (val: number) => {
  page.value = val;
  fetchData(); // 重新获取数据
};

const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val;
};

const add = () => {
  isEdit.value = false;
  Ids.value = "";
  resetForm();
  // 自动生成设备编号
  formData.bianhao = generateDeviceNumber();
  dialogVisible.value = true;
};

const aloneFn = async (row: any) => {
  const res = await MenjinDetail(row._id);
  if (res.data.code === 200) {
    aloneData.value = res.data.data;
    viewDialogVisible.value = true;
  } else {
    ElMessage.error(res.data.msg || "获取设备详情失败");
  }
};

const EditFn = async (row: any) => {
  isEdit.value = true;
  Ids.value = row._id;

    const res = await MenjinDetail(row._id);
    if (res.data.code === 200) {
      const data = res.data.data;
      Object.keys(formData).forEach((key) => {
        formData[key] = data[key] || "";
      });
      dialogVisible.value = true;
    } else {
      ElMessage.error(res.data.msg || "获取设备详情失败");
    }
};

const delFn = (row: any) => {
  ElMessageBox.confirm(`确定要删除设备"${row.name}"吗？`, "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
      const res = await delMenjin(row._id);
      if (res.data.code === 200) {
        ElMessage.success("删除成功");
        fetchData();
      } else {
        ElMessage.error(res.data.msg || "删除失败");
      }
  });
};

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
      const ids = multipleSelection.value.map((item) => item._id);
      const res = await allDelMenjin(ids);
      if (res.data.code === 200) {
        ElMessage.success(`成功删除 ${res.data.deletedCount} 个设备`);
        fetchData();
      } else {
        ElMessage.error(res.data.msg || "批量删除失败");
      }
  });
};

const submitFn = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true;
        let res;
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
        submitLoading.value = false;
    }
  });
};

const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    if (key === "status") {
      formData[key] = "正常";
    } else {
      formData[key] = "";
    }
  });
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.menjin-page {
  padding: 20px;
}

.search-form {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.image-section {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.image-section h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.image-gallery {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.image-item {
  text-align: center;
}

.image-item p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.el-tag {
  font-weight: 500;
}

:deep(.el-table .el-table__row) {
  height: 60px;
}

@media (max-width: 1200px) {
  .search-form .el-form-item {
    margin-bottom: 15px;
  }
}
</style>