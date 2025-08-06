// auth.js 类型声明
declare module '@/api/auth' {
  import { AxiosResponse } from 'axios'

  // 通用响应类型
  interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
  }

  // 租户信息类型 - 只包含模型中的字段和关联数据
  interface ZuhuData {
    _id?: string
    companyId: string
    employeeId?: string | null
    hetongId?: string | null
    status: '正常' | '暂停' | '终止'
    created_at?: string
    updated_at?: string
    // 关联数据
    company?: {
      _id: string
      name: string
      inaddress: string
      outaddress: string
      type: string
      logo?: string
      house: string
    }
    employee?: {
      _id: string
      name: string
      sex: string
      phone: string
      email: string
      picture?: string
      role: string
      sfz?: string
      weixin?: string
    }
    contract?: {
      _id: string
      he_bian: string
      name: string
      startDate: string
      endDate: string
      louyu: string
      fangjian: string
    }
  }

  // 企业类型
  interface Company {
    _id: string
    name: string
    inaddress?: string
    outaddress?: string
    type?: string
    logo?: string
    house?: string
  }

  // 员工类型
  interface Employee {
    _id: string
    name: string
    sex?: '男' | '女'
    phone?: string
    email?: string
    picture?: string
    role?: string
    company_id?: string
  }

  // 合同类型
  interface Contract {
    _id: string
    he_bian: string
    name: string
    startDate?: string
    endDate?: string
    louyu?: string
    fangjian?: string
  }

  // API函数类型声明
  export function zuhuList(params?: Record<string, any>): Promise<AxiosResponse<ApiResponse<{ list: ZuhuData[], total: number, page: number, size: number, pages: number }>>>
  export function zuhuDetail(id: string): Promise<AxiosResponse<ApiResponse<ZuhuData>>>
  export function addZuhu(data: Partial<ZuhuData>): Promise<AxiosResponse<ApiResponse<ZuhuData>>>
  export function updateZuhu(id: string, data: Partial<ZuhuData>): Promise<AxiosResponse<ApiResponse<ZuhuData>>>
  export function deleteZuhu(id: string): Promise<AxiosResponse<ApiResponse>>
  export function batchDeleteZuhu(ids: string[]): Promise<AxiosResponse<ApiResponse>>
  export function getContracts(params?: Record<string, any>): Promise<AxiosResponse<ApiResponse<Contract[]>>>
  export function getCompanies(params?: Record<string, any>): Promise<AxiosResponse<ApiResponse<Company[]>>>
  export function getCompanyEmployees(companyId: string): Promise<AxiosResponse<ApiResponse<Employee[]>>>
  export function zuhuStats(params?: Record<string, any>): Promise<AxiosResponse<ApiResponse>>

  // 其他API函数类型声明
  export function MenjinList(params?: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function MenjinDetail(id: string): Promise<AxiosResponse<ApiResponse>>
  export function addMenjin(data: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function upMenjin(id: string, data: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function delMenjin(id: string): Promise<AxiosResponse<ApiResponse>>
  export function allDelMenjin(ids: string[]): Promise<AxiosResponse<ApiResponse>>

  export function wenList(params?: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function wenDetail(id: string): Promise<AxiosResponse<ApiResponse>>
  export function deleteWen(id: string): Promise<AxiosResponse<ApiResponse>>
  export function batchDeleteWen(ids: string[]): Promise<AxiosResponse<ApiResponse>>
  export function updateNewsStatus(id: string, data: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function uploadFile(data: FormData): Promise<AxiosResponse<ApiResponse>>

  export function hetongList(params?: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function hetongDetail(id: string): Promise<AxiosResponse<ApiResponse>>
  export function addHetong(data: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function updateHetong(id: string, data: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function deleteHetong(id: string): Promise<AxiosResponse<ApiResponse>>
  export function batchDeleteHetong(ids: string[]): Promise<AxiosResponse<ApiResponse>>
  export function hetongStatistics(): Promise<AxiosResponse<ApiResponse>>
  export function hetongExpiring(params?: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function availableRooms(params?: Record<string, any>): Promise<AxiosResponse<ApiResponse>>

  export function kehuList(params?: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function kehuDetail(id: string): Promise<AxiosResponse<ApiResponse>>
  export function addKehu(data: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function updateKehu(id: string, data: Record<string, any>): Promise<AxiosResponse<ApiResponse>>
  export function deleteKehu(id: string): Promise<AxiosResponse<ApiResponse>>
  export function batchDeleteKehu(ids: string[]): Promise<AxiosResponse<ApiResponse>>
  export function kehuStats(params?: Record<string, any>): Promise<AxiosResponse<ApiResponse>>

  export default any
} 