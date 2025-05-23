import { defineConfig } from 'vitepress'

import { devDependencies } from '../package.json'
import markdownItTaskCheckbox from 'markdown-it-task-checkbox'
import { groupIconMdPlugin, groupIconVitePlugin, localIconLoader } from 'vitepress-plugin-group-icons'
import { MermaidMarkdown, MermaidPlugin } from 'vitepress-plugin-mermaid';
import { generateSidebar } from 'vitepress-sidebar'

export default defineConfig({
  lang: 'zh-CN',
  title: "Blog",
  description: "AoSnow's Blog",

  // #region fav
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],
  // #endregion fav

  base: '/Blog/', //网站部署到github的vitepress这个仓库里
  ignoreDeadLinks: true,
  //cleanUrls:true, //开启纯净链接无html

  //启用深色模式
  appearance: 'dark',

  //多语言
  // locales: {
  //   root: {
  //     label: '简体中文',
  //     lang: 'Zh_CN',
  //   },
  //   en: {
  //     label: 'English',
  //     lang: 'en',
  //     link: '/en/',
  //   },
  //   fr: {
  //     label: 'French',
  //     lang: 'fr',
  //     link: '/fr/',
  //   }
  // },

  //markdown配置
  markdown: {
    //行号显示
    lineNumbers: true,

    // toc显示一级标题
    toc: {level: [1,2,3]},

    // 使用 `!!code` 防止转换
    codeTransformers: [
      {
        postprocess(code) {
          return code.replace(/\[\!\!code/g, '[!code')
        }
      }
    ],

    // 开启图片懒加载
    image: {
      lazyLoading: true
    },

    // 组件插入h1标题下
    config: (md) => {
      md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
        let htmlResult = slf.renderToken(tokens, idx, options)
        if (tokens[idx].tag === 'h1') htmlResult += `<ArticleMetadata />`
        return htmlResult
      },

      md.use(groupIconMdPlugin) //代码组图标
      md.use(markdownItTaskCheckbox) //todo
      md.use(MermaidMarkdown); 

    }

  },

  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          ts: localIconLoader(import.meta.url, '../public/svg/typescript.svg'), //本地ts图标导入
          md: localIconLoader(import.meta.url, '../public/svg/md.svg'), //markdown图标
          css: localIconLoader(import.meta.url, '../public/svg/css.svg'), //css图标
          js: 'logos:javascript', //js图标
        },
      }),
      [MermaidPlugin()]
    ],
    optimizeDeps: {
      include: ['mermaid'],
    },
    ssr: {
      noExternal: ['mermaid'],
    },
  },

  lastUpdated: true, //此配置不会立即生效，需git提交后爬取时间戳，没有安装git本地报错可以先注释

  //主题配置
  themeConfig: {
    //左上角logo
    logo: '/logo3.png',
    //logo: 'https://vitejs.cn/vite3-cn/logo-with-shadow.png', //远程引用
    //siteTitle: false, //标题隐藏

    //设置站点标题 会覆盖title
    //siteTitle: 'Hello World',

    //编辑本页
    editLink: {
      pattern: 'https://github.com/ZongaoHuang/Blog', // 改成自己的仓库
      text: '在GitHub编辑本页'
    },

    //上次更新时间
    lastUpdated: {
      text: '上次更新时间',
      formatOptions: {
        dateStyle: 'short', // 可选值full、long、medium、short
        timeStyle: 'medium' // 可选值full、long、medium、short
      },
    },

    //导航栏
    nav: [
      { text: '首页', link: '/' },
    ],


    //侧边栏,，参照插件：https://github.com/jooy2/vitepress-sidebar
    sidebar: generateSidebar([
      {
        documentRootPath: '/', //文档根目录
        scanStartPath: 'Misc',
        resolvePath: '/Misc/',
        excludePattern: ['attachments/'],
      },
      {
        documentRootPath: '/', //文档根目录
        scanStartPath: 'Diary',
        resolvePath: '/Diary/',
        sortMenusByFrontmatterDate: true,
        sortMenusOrderByDescending: true,
        excludePattern: ['attachments/'],
      },
      {
        documentRootPath: '/', //文档根目录
        scanStartPath: 'Npm',
        resolvePath: '/Npm/',
        sortMenusByFrontmatterDate: true,
        sortMenusOrderByDescending: true,
        excludePattern: ['attachments/'],
      },
      {
        documentRootPath: '/', //文档根目录
        scanStartPath: 'Tools',
        resolvePath: '/Tools/',
        sortMenusByFrontmatterDate: true,
        sortMenusOrderByDescending: true,
        excludePattern: ['attachments/'],
      },
      {
        documentRootPath: '/', //文档根目录
        scanStartPath: 'Workflow',
        resolvePath: '/Workflow/',
        sortMenusByFrontmatterDate: true,
        sortMenusOrderByDescending: true,
        excludePattern: ['attachments/'],
      },
      {
        documentRootPath: '/', //文档根目录
        scanStartPath: 'SourceCode',
        resolvePath: '/SourceCode/',
        sortMenusByFrontmatterDate: true,
        sortMenusOrderByDescending: true,
        excludePattern: ['attachments/'],
      },
    ]),



    //Algolia搜索
    search: {
      provider: 'algolia',
      options: {
        appId: 'DVPBWZ7F33',
        apiKey: '156d8274221b76c89f5f1e7ea3397bea',
        indexName: 'zongaohuangio',
        locales: {
          root: {
            placeholder: '搜索文档',
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                searchBox: {
                  resetButtonTitle: '清除查询条件',
                  resetButtonAriaLabel: '清除查询条件',
                  cancelButtonText: '取消',
                  cancelButtonAriaLabel: '取消'
                },
                startScreen: {
                  recentSearchesTitle: '搜索历史',
                  noRecentSearchesText: '没有搜索历史',
                  saveRecentSearchButtonTitle: '保存至搜索历史',
                  removeRecentSearchButtonTitle: '从搜索历史中移除',
                  favoriteSearchesTitle: '收藏',
                  removeFavoriteSearchButtonTitle: '从收藏中移除'
                },
                errorScreen: {
                  titleText: '无法获取结果',
                  helpText: '你可能需要检查你的网络连接'
                },
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                  searchByText: '搜索提供者'
                },
                noResultsScreen: {
                  noResultsText: '无法找到相关结果',
                  suggestedQueryText: '你可以尝试查询',
                  reportMissingResultsText: '你认为该查询应该有结果？',
                  reportMissingResultsLinkText: '点击反馈'
                },
              },
            },
          },
        },
      },
    },



    //社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ZongaoHuang' },
    ],

    //手机端深浅模式文字修改
    darkModeSwitchLabel: '深浅模式',




    //页脚
    footer: {
      message: '菜就多练',
      // copyright: `Copyright © 2023-${new Date().getFullYear()} 备案号：<a href="https://beian.miit.gov.cn/" target="_blank">京****号</a>`,
      copyright: `Copyright © 2025-${new Date().getFullYear()}`,
    },


    //侧边栏文字更改(移动端)
    sidebarMenuLabel: '目录',

    //返回顶部文字修改(移动端)
    returnToTopLabel: '返回顶部',


    //大纲显示2-3级标题
    outline: {
      level: [2, 3],
      label: '当前页大纲'
    },


    //自定义上下页名
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

  },
})