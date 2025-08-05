import { ref, reactive } from 'vue'
import type { Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export interface CrudOptions<T = any> {
  // API方法
  listApi: (params?: any) => Promise<any>
  addApi: (data: any) => Promise<any>
  updateApi: (id: string, data: any) => Promise<any>
  deleteApi: (id: string) => Promise<any>
  batchDeleteApi?: (ids: string[]) => Promise<any>
  
  // 配置
  pageSize?: number
  defaultFormData?: () => T
}

export interface Pagination {
  page: number
  size: number
  total: number
}

export function useCrud<T = any>(options: CrudOptions<T>) {
  // 响应式状态
  const loading: Ref<boolean> = ref(false)
  const submitLoading: Ref<boolean> = ref(false)
  const dialogVisible: Ref<boolean> = ref(false)
  const isEdit: Ref<boolean> = ref(false)
  const currentEditId: Ref<string> = ref('')
  const selectedRows: Ref<T[]> = ref([])
  const tableData: Ref<T[]> = ref([])

  // 分页信息
  const pagination: Pagination = reactive({
    page: 1,
    size: options.pageSize || 10,
    total: 0
  })

  // 筛选表单
  const filterForm: Ref<Record<string, any>> = ref({})

  // 表单数据
  const formData: Ref<T> = ref(
    options.defaultFormData ? options.defaultFormData() : {} as T
  )

  // 获取列表数据
  const fetchList = async (params?: Record<string, any>) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.page,
        size: pagination.size,
        ...filterForm.value,
        ...params
      }
      
      // 清除空值
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key]
        }
      })
      
      const response = await options.listApi(queryParams)
      if (response.data.code === 200) {
        tableData.value = response.data.data
        pagination.total = response.data.total
      } else {
        ElMessage.error(response.data.msg || '获取列表失败')
      }
    } catch (error: any) {
      console.error('获取列表失败:', error)
      ElMessage.error('获取列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.page = 1
    fetchList()
  }

  // 重置
  const handleReset = () => {
    filterForm.value = {}
    pagination.page = 1
    fetchList()
  }

  // 分页事件
  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.page = 1
    fetchList()
  }

  const handleCurrentChange = (page: number) => {
    pagination.page = page
    fetchList()
  }

  // 选择事件
  const handleSelectionChange = (selection: T[]) => {
    selectedRows.value = selection
  }

  // 新增
  const handleAdd = () => {
    isEdit.value = false
    currentEditId.value = ''
    if (options.defaultFormData) {
      formData.value = options.defaultFormData()
    }
    dialogVisible.value = true
  }

  // 编辑
  const handleEdit = (row: T) => {
    isEdit.value = true
    currentEditId.value = (row as any)._id || ''
    formData.value = { ...row }
    dialogVisible.value = true
  }

  // 删除
  const handleDelete = async (row: T) => {
    try {
      await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      const response = await options.deleteApi((row as any)._id || '')
      if (response.data.code === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(response.data.msg || '删除失败')
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (!options.batchDeleteApi) {
      ElMessage.warning('暂不支持批量删除')
      return
    }

    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的记录')
      return
    }
    
    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      const ids = selectedRows.value.map((row: any) => row._id)
      const response = await options.batchDeleteApi(ids)
      if (response.data.code === 200) {
        ElMessage.success(`成功删除 ${response.data.deletedCount} 条记录`)
        fetchList()
        selectedRows.value = []
      } else {
        ElMessage.error(response.data.msg || '批量删除失败')
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败')
      }
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      submitLoading.value = true
      
      let response: any
      if (isEdit.value) {
        response = await options.updateApi(currentEditId.value, formData.value)
      } else {
        response = await options.addApi(formData.value)
      }
      
      if (response.data.code === 200) {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        dialogVisible.value = false
        fetchList()
      } else {
        ElMessage.error(response.data.msg || (isEdit.value ? '更新失败' : '创建失败'))
      }
    } catch (error: any) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败')
    } finally {
      submitLoading.value = false
    }
  }

  // 取消弹窗
  const handleCancel = () => {
    dialogVisible.value = false
  }

  return {
    // 状态
    loading,
    submitLoading,
    dialogVisible,
    isEdit,
    currentEditId,
    selectedRows,
    tableData,
    pagination,
    filterForm,
    formData,
    
    // 方法
    fetchList,
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleSubmit,
    handleCancel
  }
} 