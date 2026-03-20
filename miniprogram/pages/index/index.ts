// pages/index/index.ts
// 获取应用实例

import { getHomeIndexData } from '../../utils/request';
import { canViewToday, recordView } from '../../utils/viewLimit';

Page({
  data: {
    // 轮播图
    bannerList: [] as { id: number; title: string; imageUrl: string; linkUrl: string }[],
    // 公告
    noticeList: [] as { id: number; title: string; content: string }[],
    // 文章列表
    articleList: [] as { id: string; title: string; date: string; isTop: number }[],
    // 网盘文章列表
    panArticleList: [] as {
      id: string;
      title: string;
      date: string;
      isTop: number;
      categoryList: string[];
    }[],
    // 公告滚动索引
    noticeCurrent: 0,
    // 公告定时器
    noticeTimer: null as number | null,
    // 加载状态
    isLoading: false,
    isError: false
  },

  async onLoad() {
    await this.loadHomeData();
    this.startNoticeScroll();
  },

  async onPullDownRefresh() {
    await this.loadHomeData();
    wx.stopPullDownRefresh();
  },

  onHide() {
    this.stopNoticeScroll();
  },

  onUnload() {
    this.stopNoticeScroll();
  },

  async loadHomeData() {
    try {
      wx.showLoading({ title: '加载中...', mask: true });
      const res = await getHomeIndexData(3, 3, 5, 5);

      this.setData({
        bannerList: res.bannerList,
        noticeList: res.noticeList,
        articleList: res.articleList,
        panArticleList: res.panArticleList,
        isLoading: false,
        isError: false
      });
    } catch (error) {
      console.error('加载首页数据失败:', error);
      this.setData({ isError: true });
    } finally {
      wx.hideLoading();
      wx.stopPullDownRefresh();
    }
  },

  // 公告滚动
  startNoticeScroll() {
    if (this.data.noticeTimer) return;
    const timer = setInterval(() => {
      const { noticeList, noticeCurrent } = this.data;
      if (noticeList.length > 1) {
        this.setData({
          noticeCurrent: (noticeCurrent + 1) % noticeList.length
        });
      }
    }, 3000) as unknown as number;
    this.setData({ noticeTimer: timer });
  },

  stopNoticeScroll() {
    if (this.data.noticeTimer) {
      clearInterval(this.data.noticeTimer);
      this.setData({ noticeTimer: null });
    }
  },

  // 公告点击
  onNoticeTap(e: any) {
    const item = e.currentTarget.dataset.item;
    if (item.content) {
      wx.showModal({
        title: item.title,
        content: item.content,
        showCancel: false
      });
    }
  },

  // 文章项点击
  onArticleItemTap(e: any) {
    const item = e.currentTarget.dataset.item;
    const { id, type, content } = item;

    console.log('跳转的 id 是：', id);
    const isHTML = /<\/?[a-z][\s\S]*>/i.test(content);
    const contentNew = isHTML ? content.replace(/<[^>]+>/g, '') : content;

    if (!canViewToday()) {
      wx.showModal({
        title: '提示',
        content: '今天首页查看次数已用完，试试上方搜索功能吧',
        confirmText: '搜索',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.goToSearch();
          }
        }
      });
      return;
    }
    recordView();

    this.navigateByType(type, id, contentNew);
  },

  // 网盘项点击
  onPanItemTap(e: any) {
    const item = e.currentTarget.dataset.item;
    const { id, type, content } = item;

    console.log('跳转的 id 是：', id);
    const isHTML = /<\/?[a-z][\s\S]*>/i.test(content);
    const contentNew = isHTML ? content.replace(/<[^>]+>/g, '') : content;

    this.navigateByType(type, id, contentNew);
  },

  // 根据类型跳转
  navigateByType(type: number, id: string, content: string) {
    if (type === 1) {
      // 1 打开外部链接
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(content)}`
      });
    } else if (type === 3) {
      // 3 打开其他小程序
      wx.navigateToMiniProgram({
        appId: content,
        path: '',
        success() {
          console.log('跳转成功');
        },
        fail(err) {
          console.error('跳转失败', err);
          wx.showToast({ title: '跳转失败', icon: 'none' });
        }
      });
    } else {
      // 0 跳转到详情页面  4网盘链接 5网盘广告
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}&type=${type}`
      });
    }
  },

  // 查看更多文章
  goToArticleList() {
    wx.navigateTo({
      url: '/pages/article-list/article-list'
    });
  },

  // 查看更多网盘
  goToPanList() {
    wx.navigateTo({
      url: '/pages/pan-list/pan-list'
    });
  },

  // 搜索
  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search?from=home'
    });
  },

  // 轮播图点击
  onBannerTap(e: any) {
    const item = e.currentTarget.dataset.item;
    if (item.linkUrl) {
      // 判断链接类型
      if (item.linkUrl.startsWith('/pages/')) {
        // 小程序内部页面
        wx.navigateTo({
          url: item.linkUrl
        });
      } else if (item.linkUrl.startsWith('http')) {
        // 外部链接
        wx.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(item.linkUrl)}`
        });
      }
    }
  },

  /**
   * 分享好友
   */
  onShareAppMessage() {
    const accountInfo = wx.getAccountInfoSync();
    const title = `${accountInfo.miniProgram.appName || '小程序'}：猴哥星球`;
    return {
      title: title
    };
  },

  /**
   * 分享朋友圈
   */
  onShareTimeline() {
    const accountInfo = wx.getAccountInfoSync();
    const title = `${accountInfo.miniProgram.appName || '小程序'}：猴哥星球`;
    return {
      title: title
    };
  }
});
