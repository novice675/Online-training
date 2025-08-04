<template>
  <div class="amap-selector">
    <div class="control-box">
      <!-- 定位按钮 -->
      <el-button 
        @click="getCurrentPosition" 
        type="primary" 
        :loading="locationLoading"
        class="location-btn"
      >
        <el-icon><Location /></el-icon>
        {{ locationLoading ? '定位中...' : '定位到我' }}
      </el-button>
      
      <!-- 使用说明 -->
      <div class="usage-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>点击地图上的任意位置选择安装地点，或使用定位按钮</span>
      </div>
    </div>

    <div ref="mapContainer" class="map-container" id="amap-container"></div>

    <div v-if="selectedLocation" class="location-info">
      <div class="location-item">
        <span class="label">选中位置：</span>
        <span class="value">{{ selectedLocation.formattedAddress }}</span>
      </div>
      <div class="location-item" v-if="selectedLocation.district">
        <span class="label">行政区域：</span>
        <span class="value">{{ selectedLocation.district }}</span>
      </div>
      <div class="location-item">
        <span class="label">坐标：</span>
        <span class="value">{{ selectedLocation.lng }}, {{ selectedLocation.lat }}</span>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Location, InfoFilled } from '@element-plus/icons-vue'

// 声明高德地图类型
declare global {
  interface Window {
    AMap: any
  }
}

// 高德地图相关类型定义
interface AMapLocation {
  lng: number
  lat: number
  formattedAddress: string
  district?: string
  address?: string
}



// Props 定义
const props = defineProps({
  // 初始位置
  defaultLocation: {
    type: Object as () => AMapLocation | null,
    default: null
  },
  // 高德地图API Key
  apiKey: {
    type: String,
    default: '17414d5ecce78099b6c60524da3ffa68' // 需要替换为实际的API Key
  },
  // 地图高度
  height: {
    type: String,
    default: '400px'
  }
})

// Events 定义
const emit = defineEmits<{
  'location-selected': [location: AMapLocation]
  'location-changed': [location: AMapLocation]
}>()

// 响应式数据
const mapContainer = ref<HTMLElement>()
const locationLoading = ref(false)
const selectedLocation = ref<AMapLocation | null>(props.defaultLocation)

// 高德地图实例
let map: any = null
let marker: any = null
let geocoder: any = null
let placeSearch: any = null

// 加载高德地图API
const loadAMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查API Key
    if (!props.apiKey || props.apiKey === 'your-amap-api-key') {
      reject(new Error('请配置有效的高德地图API Key'))
      return
    }
    
    console.log('开始加载高德地图API，Key:', props.apiKey.substring(0, 8) + '...')

    if (window.AMap) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${props.apiKey}&plugin=AMap.PlaceSearch,AMap.Geocoder`
    script.onload = () => {
      console.log('高德地图脚本加载完成')
      // 确保插件加载完成
      if (window.AMap && window.AMap.Geocoder && window.AMap.PlaceSearch) {
        console.log('高德地图插件加载成功')
        resolve()
      } else {
        console.log('等待高德地图插件加载完成...')
        // 等待插件加载完成
        let attempts = 0
        const checkInterval = setInterval(() => {
          attempts++
          if (window.AMap && window.AMap.Geocoder && window.AMap.PlaceSearch) {
            console.log('高德地图插件延迟加载成功')
            clearInterval(checkInterval)
            resolve()
          } else if (attempts > 10) {
            clearInterval(checkInterval)
            console.error('高德地图插件加载超时')
            reject(new Error('高德地图插件加载超时，请检查API Key或网络连接'))
          }
        }, 500)
      }
    }
    script.onerror = () => {
      console.error('高德地图API脚本加载失败')
      reject(new Error('高德地图API加载失败，请检查网络连接和API Key'))
    }
    document.head.appendChild(script)
  })
}

// 初始化地图
const initMap = async () => {
  try {
    await loadAMapScript()
    
    if (!mapContainer.value) return

    // 确保AMap和所需插件都已加载
    if (!window.AMap || !window.AMap.Geocoder || !window.AMap.PlaceSearch) {
      throw new Error('高德地图插件未正确加载')
    }

    // 创建地图实例
    map = new window.AMap.Map(mapContainer.value, {
      zoom: 15,
      center: [116.397428, 39.90923], // 默认北京中心
      mapStyle: 'amap://styles/normal', // 使用标准地图样式
      viewMode: '2D', // 2D模式
      lang: 'zh_cn', // 中文
      resizeEnable: true, // 允许调整大小
      showBuildingBlock: true, // 显示楼块
      showLabel: true // 显示标注
    })

    // 地图加载完成事件
    map.on('complete', () => {
      try {
        console.log('地图加载完成')
        
        // 强制调整地图大小
        setTimeout(() => {
          map.getSize()
          map.resize()
        }, 100)

        // 创建地理编码实例
        geocoder = new window.AMap.Geocoder({
          radius: 1000,
          extensions: 'all'
        })

        // 创建地点搜索实例 - 指定搜索城市
        placeSearch = new window.AMap.PlaceSearch({
          city: '北京',  // 指定搜索城市
          pageSize: 10,
          pageIndex: 1
        })
        
        console.log('PlaceSearch初始化完成:', placeSearch)

        console.log('地图和插件初始化完成')
        
        // 尝试获取用户当前位置
        getCurrentPosition()
      } catch (pluginError) {
        console.error('插件初始化失败:', pluginError)
        ElMessage.error('地图插件初始化失败')
      }
    })

    // 地图瓦片加载完成事件
    map.on('complete', () => {
      console.log('地图瓦片加载完成')
    })

    // 地图错误事件
    map.on('error', (error) => {
      console.error('地图加载错误:', error)
      ElMessage.error('地图加载失败，请检查网络连接')
    })

        // 地图点击事件
        map.on('click', (e: any) => {
          const lng = e.lnglat.getLng()
          const lat = e.lnglat.getLat()
          
          // 检查geocoder是否已初始化
          if (!geocoder) {
            ElMessage.warning('地图组件正在初始化中，请稍后再试')
            return
          }
          
          // 逆地理编码获取地址信息
          geocoder.getAddress([lng, lat], (status: string, result: any) => {
            if (status === 'complete' && result.regeocode) {
              const location: AMapLocation = {
                lng,
                lat,
                formattedAddress: result.regeocode.formattedAddress,
                district: result.regeocode.addressComponent.district
              }
              
              setSelectedLocation(location)
              emit('location-changed', location)
            } else {
              ElMessage.warning('无法获取该位置的地址信息')
            }
          })
        })

    // 如果有默认位置，设置地图中心和标记
    if (props.defaultLocation) {
      setSelectedLocation(props.defaultLocation)
      map.setCenter([props.defaultLocation.lng, props.defaultLocation.lat])
    } else {
      // 确保地图始终显示北京（保证有瓦片数据）
      map.setCenter([116.397428, 39.90923])
      map.setZoom(12)
    }

  } catch (error) {
    console.error('地图初始化失败:', error)
    ElMessage.error('地图加载失败，请检查网络连接')
  }
}

// 设置选中位置
const setSelectedLocation = (location: AMapLocation) => {
  selectedLocation.value = location
  
  // 检查地图是否已初始化
  if (!map || !window.AMap) {
    console.warn('地图未初始化，无法设置标记')
    return
  }
  
  // 移除旧标记
  if (marker) {
    map.remove(marker)
  }
  
  // 添加新标记
  try {
    marker = new window.AMap.Marker({
      position: [location.lng, location.lat],
      title: location.formattedAddress
    })
    
    map.add(marker)
    map.setCenter([location.lng, location.lat])
  } catch (error) {
    console.error('创建地图标记失败:', error)
  }
}



// 确认选择位置
const confirmLocation = () => {
  if (!selectedLocation.value) {
    ElMessage.warning('请先选择位置')
    return false
  }
  
  emit('location-selected', selectedLocation.value)
  return true
}

// 获取当前选中位置
const getCurrentLocation = () => {
  return selectedLocation.value
}

// 检查坐标是否在中国境内
const isLocationInChina = (lng: number, lat: number): boolean => {
  // 中国大致坐标范围（包含港澳台）
  // 经度：73°33′E 至 135°05′E
  // 纬度：3°51′N 至 53°33′N
  return lng >= 73.5 && lng <= 135.1 && lat >= 3.8 && lat <= 53.6
}

// 获取用户当前地理位置
const getCurrentPosition = () => {
  if (!navigator.geolocation) {
    console.log('浏览器不支持地理位置获取')
    ElMessage.warning('浏览器不支持地理位置获取')
    return
  }

  locationLoading.value = true
  ElMessage.info('正在获取您的位置...')
  
  navigator.geolocation.getCurrentPosition(
    // 成功获取位置
    (position) => {
      const { latitude, longitude } = position.coords
      console.log('获取到用户位置:', latitude, longitude)
      
      // 检查坐标是否在中国境内
      let finalLng = longitude
      let finalLat = latitude
      let isInChina = isLocationInChina(longitude, latitude)
      
      if (!isInChina) {
        // 坐标不在中国境内，强制定位到北京
        finalLng = 116.397428  // 北京经度
        finalLat = 39.90923    // 北京纬度
        console.log('坐标不在中国境内，自动定位到北京')
        ElMessage.warning('检测到您的位置在海外，已自动定位到北京，请手动选择准确位置')
      }
      
      if (map && geocoder) {
        // 设置地图中心到最终位置
        map.setCenter([finalLng, finalLat])
        map.setZoom(isInChina ? 16 : 12) // 境外定位时缩放级别小一些
        
        // 逆地理编码获取地址信息
        geocoder.getAddress([finalLng, finalLat], (status: string, result: any) => {
          if (status === 'complete' && result.regeocode) {
            const userLocation: AMapLocation = {
              lng: finalLng,
              lat: finalLat,
              formattedAddress: result.regeocode.formattedAddress,
              district: result.regeocode.addressComponent.district
            }
            
            // 设置为选中位置
            setSelectedLocation(userLocation)
            ElMessage.success(isInChina ? '已定位到您的当前位置' : '已定位到北京市，请手动选择准确位置')
            locationLoading.value = false
          } else {
            // 即使地址解析失败，也显示位置
            const userLocation: AMapLocation = {
              lng: finalLng,
              lat: finalLat,
              formattedAddress: isInChina ? `经度:${finalLng.toFixed(6)}, 纬度:${finalLat.toFixed(6)}` : '北京市',
              district: isInChina ? '未知区域' : '北京市'
            }
            setSelectedLocation(userLocation)
            ElMessage.success(isInChina ? '已定位到您的当前位置' : '已定位到北京市，请手动选择准确位置')
            locationLoading.value = false
          }
        })
      } else {
        locationLoading.value = false
      }
    },
    // 获取位置失败
    (error) => {
      console.error('获取位置失败:', error)
      let errorMsg = '获取位置失败'
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = '用户拒绝了位置权限请求'
          break
        case error.POSITION_UNAVAILABLE:
          errorMsg = '位置信息不可用'
          break
        case error.TIMEOUT:
          errorMsg = '获取位置超时'
          break
        default:
          errorMsg = '获取位置时发生未知错误'
          break
      }
      
      ElMessage.warning(errorMsg + '，请手动选择位置')
      locationLoading.value = false
    },
    // 选项配置
    {
      enableHighAccuracy: true, // 高精度定位
      timeout: 10000, // 10秒超时
      maximumAge: 60000 // 缓存1分钟
    }
  )
}

// 刷新地图显示
const refreshMap = () => {
  if (map) {
    setTimeout(() => {
      map.resize()
    }, 200)
  }
}

// 暴露方法给父组件
defineExpose({
  confirmLocation,
  getCurrentLocation,
  getCurrentPosition,
  refreshMap
})

// 生命周期
onMounted(async () => {
  await nextTick()
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.destroy()
  }
})
</script>

<style scoped>
.amap-selector {
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.control-box {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.location-btn {
  align-self: flex-start;
  min-width: 120px;
}

.usage-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
  font-size: 13px;
  color: #0369a1;
}

.usage-tip .el-icon {
  font-size: 14px;
  color: #0ea5e9;
}

.map-container {
  flex: 1;
  width: 100%;
  max-width: 100%;
  height: 350px;
  min-height: 300px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* 确保高德地图容器正确显示 */
.map-container :deep(.amap-container) {
  width: 100% !important;
  height: 100% !important;
}

.location-info {
  margin-top: 15px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  max-width: 100%;
  box-sizing: border-box;
}

.location-item {
  display: flex;
  margin-bottom: 6px;
  word-break: break-all;
  overflow: hidden;
}

.location-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
  white-space: nowrap;
  flex-shrink: 0;
}

.value {
  color: #303133;
  flex: 1;
  word-break: break-all;
  overflow: hidden;
}

.search-results {
  margin-top: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.results-title {
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.result-item {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover {
  background-color: #f5f7fa;
}

.result-item:last-child {
  border-bottom: none;
}

.result-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.result-address {
  font-size: 13px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-container {
    min-height: 300px;
  }
  
  .location-item {
    flex-direction: column;
  }
  
  .label {
    min-width: auto;
    margin-bottom: 2px;
  }
}
</style> 