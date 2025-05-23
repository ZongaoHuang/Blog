<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 日记文件的接口定义
interface DiaryFile {
  date: string
  path: string
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
}

// 使用 import.meta.glob 获取所有日记文件
const diaryFiles = import.meta.glob('/Diary/*.md', { eager: true })
const posts = ref<DiaryFile[]>([])

// 月份名称映射
const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月', 
  '七月', '八月', '九月', '十月', '十一月', '十二月'
]

onMounted(() => {
  // 处理所有日记文件
  const diaryPosts: DiaryFile[] = []
  
  for (const path in diaryFiles) {
    // 跳过Diary.md本身
    if (path === '/Diary/Diary.md') continue
    
    // 从文件路径中提取日期（如: /Diary/2023-12-15.md -> 2023-12-15）
    const fileName = path.split('/').pop() || ''
    const dateStr = fileName.replace('.md', '')
    
    // 确保文件名是合法的日期格式
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      diaryPosts.push({
        date: dateStr,
        path: path.replace('.md', '')
      })
    }
  }
  
  // 按日期排序（最新的排在前面）
  posts.value = diaryPosts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
})

// 按年份和月份统计
const yearStats = computed(() => {
  const years: Record<number, YearStats> = {}
  
  posts.value.forEach(post => {
    if (!post.date) return
    
    const date = new Date(post.date)
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // 初始化年份数据
    if (!years[year]) {
      years[year] = {
        year,
        count: 0,
        months: Array(12).fill(0).map((_, i) => ({
          year,
          month: i,
          monthName: monthNames[i],
          count: 0
        }))
      }
    }
    
    // 更新计数
    years[year].count++
    years[year].months[month].count++
  })
  
  // 转换为数组并按年份倒序排序
  return Object.values(years).sort((a, b) => b.year - a.year)
})
</script>

<template>
  <div class="diary-archive">
    <div v-if="posts.length === 0" class="diary-empty">
      <p>暂无日记内容</p>
    </div>
    
    <div v-else class="diary-stats">
      <div v-for="yearStat in yearStats" :key="yearStat.year" class="year-block">
        <div class="year-header">
          <span class="year-title">{{ yearStat.year }}年</span>
          <span class="year-count">共 {{ yearStat.count }} 篇</span>
        </div>
        
        <div class="month-blocks">
          <router-link
            v-for="monthStat in yearStat.months"
            :key="`${yearStat.year}-${monthStat.month}`"
            :to="`/archive/${yearStat.year}/${monthStat.month + 1}`"
            class="month-block"
            :class="{ 'has-posts': monthStat.count > 0 }"
          >
            <div class="month-name">{{ monthStat.monthName }}</div>
            <div class="month-count" v-if="monthStat.count > 0">{{ monthStat.count }}</div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diary-archive {
  padding: 1rem 0;
}

.diary-empty {
  padding: 2rem 0;
  text-align: center;
  color: var(--vp-c-text-2);
}

.diary-stats {
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
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.month-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  border-radius: 8px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.month-block.has-posts {
  background-color: var(--vp-c-brand-dimm);
  border-color: var(--vp-c-brand-soft);
}

.month-block:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  margin-top: 0.5rem;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .month-blocks {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .month-block {
    height: 70px;
  }
}
</style>
