// pages/article-list/article-list.ts

import { getListData } from '../../utils/request';
import { canViewToday, recordView } from '../../utils/viewLimit';

Page({
  data: {
    keywords: '',
    placeholder: '请输入关键词进行搜索',
    list: [] as {
      id: string;
      title: string;
      date: string;
      isTop: number;
      type: number;
      content: string;
    }[],
    pageNum: 1,
    pageSize: 12,
    hasMore: true,
    loadingMore: false,
    isLoading: false
  },

  onLoad() {
    this.loadList(true);
  },

  onInputChange(e: any) {
    this.setData({ keywords: e.detail.value });
  },

  async onSearch() {
    const { keywords } = this.data;
    if (!keywords.trim()) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' });
      return;
    }
    this.setData({ pageNum: 1, hasMore: true });
    await this.loadList(true);
  },

  async onClearSearch() {
    this.setData({ keywords: '', pageNum: 1, hasMore: true });
    await this.loadList(true);
  },

  async onPullDownRefresh() {
    this.setData({ pageNum: 1, hasMore: true });
    await this.loadList(true);
    wx.stopPullDownRefresh();
  },

  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({ loadingMore: true });
    await this.loadList(false);
    this.setData({ loadingMore: false });
  },

  async loadList(refresh: boolean) {
    let { pageNum, pageSize, list, keywords } = this.data;

    if (!refresh) {
      pageNum += 1;
    } else {
      pageNum = 1;
    }

    try {
      if (refresh) {
        wx.showLoading({ title: '加载中...', mask: true });
      }
      this.setData({ isLoading: true });

      const res = await getListData(pageNum, pageSize, keywords);
      const newList = refresh ? res.data : list.concat(res.data);
      const hasMore = res.data.length >= pageSize;

      this.setData({
        list: newList,
        pageNum: pageNum,
        hasMore: hasMore
      });
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      this.setData({ isLoading: false });
    }
  },

  onItemTap(e: any) {
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

    if (type === 1) {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(contentNew)}`
      });
    } else if (type === 3) {
      wx.navigateToMiniProgram({
        appId: contentNew,
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
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}&type=${type}`
      });
    }
  },

  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search?from=home'
    });
  },

  onShareAppMessage() {
    const accountInfo = wx.getAccountInfoSync();
    const title = `${accountInfo.miniProgram.appName || '小程序'}：猴哥星球`;
    return {
      title: title
    };
  },

  onShareTimeline() {
    const accountInfo = wx.getAccountInfoSync();
    const title = `${accountInfo.miniProgram.appName || '小程序'}：猴哥星球`;
    return {
      title: title
    };
  }
});
