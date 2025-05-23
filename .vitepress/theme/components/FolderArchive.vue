<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useData, useRouter } from 'vitepress'

// 组件props
interface Props {
  folderPath: string  // 文件夹路径，如 '/Npm'
  title?: string      // 显示标题，默认使用文件夹名
}

const props = withDefaults(defineProps<Props>(), {
  title: ''
})

// 文件信息接口
interface FileInfo {
  name: string
  path: string
  createTime: Date
}

// 年度统计接口
interface YearStats {
  year: number
  count: number
  months: MonthStats[]
}

// 月度统计接口
interface MonthStats {
  year: number
  month: number
  monthName: string
  count: number
  files: FileInfo[]
}

const files = ref<FileInfo[]>([])
const expandedMonths = ref<Set<string>>(new Set()) // 展开的月份状态
const { site } = useData()
const router = useRouter()

// 月份名称映射
const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月', 
  '七月', '八月', '九月', '十月', '十一月', '十二月'
]

// 获取文件夹名称
const folderName = computed(() => {
  return props.title || props.folderPath.split('/').pop() || 'Files'
})

onMounted(async () => {
  try {
    // 使用 import.meta.glob 获取指定文件夹中的所有文件
    const pattern = `${props.folderPath}/**/*.md`
    const modules = import.meta.glob('/**/*.md', { eager: true })
    
    const fileList: FileInfo[] = []
    
    for (const [path, module] of Object.entries(modules)) {
      // 检查文件是否在指定文件夹中
      if (path.startsWith(props.folderPath) && path !== `${props.folderPath}.md`) {
        const fileName = path.split('/').pop()?.replace('.md', '') || ''
        
        // 获取文件的创建时间
        let createTime = new Date()
        
        // 尝试从文件的 frontmatter 中获取创建时间
        if (module && typeof module === 'object' && 'frontmatter' in module) {
          const frontmatter = module.frontmatter as any
          if (frontmatter?.date) {
            createTime = new Date(frontmatter.date)
          } else if (frontmatter?.created) {
            createTime = new Date(frontmatter.created)
          }
        }
        
        // 如果没有 frontmatter 中的时间，尝试从文件名解析日期
        const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/)
        if (dateMatch) {
          createTime = new Date(dateMatch[1])
        }
        
        fileList.push({
          name: fileName,
          path: path.replace('.md', ''),
          createTime
        })
      }
    }
    
    // 按创建时间排序（最新的在前）
    files.value = fileList.sort((a, b) => 
      b.createTime.getTime() - a.createTime.getTime()
    )
  } catch (error) {
    console.error('Failed to load files:', error)
  }
})

// 按年份和月份统计
const yearStats = computed(() => {
  const years: Record<number, YearStats> = {}
  
  files.value.forEach(file => {
    const year = file.createTime.getFullYear()
    const month = file.createTime.getMonth()
    
    // 初始化年份数据
    if (!years[year]) {
      years[year] = {
        year,
        count: 0,
        months: Array(12).fill(0).map((_, i) => ({
          year,
          month: i,
          monthName: monthNames[i],
          count: 0,
          files: []
        }))
      }
    }
    
    // 更新计数
    years[year].count++
    years[year].months[month].count++
    years[year].months[month].files.push(file)
  })
  
  // 转换为数组并按年份倒序排序
  return Object.values(years).sort((a, b) => b.year - a.year)
})

// 切换月份展开状态
const toggleMonth = (yearMonth: string) => {
  if (expandedMonths.value.has(yearMonth)) {
    expandedMonths.value.delete(yearMonth)
  } else {
    expandedMonths.value.add(yearMonth)
  }
}

// 检查月份是否展开
const isMonthExpanded = (year: number, month: number) => {
  return expandedMonths.value.has(`${year}-${month}`)
}

// 处理文件跳转
const navigateToFile = (filePath: string) => {
  // 移除开头的斜杠并添加 .html 扩展名
  let cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath
  // 确保路径以 .html 结尾
  if (!cleanPath.endsWith('.html')) {
    cleanPath += '.html'
  }
  // 在前面加上 /Blog/ 前缀
  const fullPath = `/Blog/${cleanPath}`
  console.log('Navigating to:', fullPath) // 调试用
  router.go(fullPath)
}
</script>

<template>
  <div class="folder-archive">
    <h2 class="archive-title">{{ folderName }} 文件归档</h2>
    
    <div v-if="files.length === 0" class="folder-empty">
      <p>暂无文件内容</p>
    </div>
    
    <div v-else class="folder-stats">
      <div class="summary">
        <p>共收录 <strong>{{ files.length }}</strong> 个文件</p>
      </div>
      
      <div v-for="yearStat in yearStats" :key="yearStat.year" class="year-block">
        <div class="year-header">
          <span class="year-title">{{ yearStat.year }}年</span>
          <span class="year-count">共 {{ yearStat.count }} 个文件</span>
        </div>
        
        <div class="month-blocks">
          <div
            v-for="monthStat in yearStat.months"
            :key="`${yearStat.year}-${monthStat.month}`"
            class="month-block"
            :class="{ 
              'has-files': monthStat.count > 0,
              'expanded': isMonthExpanded(monthStat.year, monthStat.month)
            }"
            @click="monthStat.count > 0 && toggleMonth(`${monthStat.year}-${monthStat.month}`)"
          >
            <div class="month-header">
              <div class="month-name">{{ monthStat.monthName }}</div>
              <div class="month-count" v-if="monthStat.count > 0">{{ monthStat.count }}</div>
              <div class="expand-icon" v-if="monthStat.count > 0">
                {{ isMonthExpanded(monthStat.year, monthStat.month) ? '▼' : '▶' }}
              </div>
            </div>
            
            <!-- 文件列表 -->
            <div 
              v-if="monthStat.count > 0 && isMonthExpanded(monthStat.year, monthStat.month)" 
              class="file-list"
              @click.stop
            >
              <a
                v-for="file in monthStat.files"
                :key="file.path"
                :href="file.path"
                class="file-link"
                :title="file.name"
                @click.prevent="navigateToFile(file.path)"
              >
                {{ file.name }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.folder-archive {
  padding: 1rem 0;
}

.archive-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 1.5rem;
  text-align: center;
}

.summary {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  color: var(--vp-c-text-2);
}

.folder-empty {
  padding: 2rem 0;
  text-align: center;
  color: var(--vp-c-text-2);
}

.folder-stats {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.year-block {
  background-color: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.year-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.year-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.year-count {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.month-blocks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.month-block {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  min-height: 80px;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.2s ease;
  position: relative;
}

.month-block.has-files {
  background-color: var(--vp-c-brand-dimm);
  border-color: var(--vp-c-brand-soft);
  cursor: pointer;
}

.month-block.expanded {
  min-height: auto;
}

.month-block:hover.has-files {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.month-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.month-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.month-count {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-brand);
}

.expand-icon {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  transition: transform 0.2s ease;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--vp-c-divider);
}

.file-link {
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  text-align: left;
  word-break: break-word;
  line-height: 1.4;
}

.file-link:hover {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
  transform: translateX(4px);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .month-blocks {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .month-block {
    min-height: 90px;
  }
  
  .file-link {
    font-size: 0.8rem;
    padding: 0.4rem;
  }
}

@media (max-width: 480px) {
  .month-blocks {
    grid-template-columns: 1fr;
  }
}
</style>
