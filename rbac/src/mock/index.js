import Mock from 'mockjs'

export const mockList = Mock.mock({
  'list|100': [
    {
      'id|+1': 1,
      name: '@cname',
      description: '@cparagraph(1, 5)',
      status: '@pick(["活跃", "待处理", "已完成"])',
      createTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
    }
  ]
}).list