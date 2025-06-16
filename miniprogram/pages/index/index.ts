// index.ts
// 获取应用实例

import { getListData } from '../../utils/request';

Page({
  data: {
    list: [] as { id: string; title: string; date: string; isTop: number }[],
    pageNum: 1,
    pageSize: 10,
    hasMore: true,
    loadingMore: false
  },

  async onLoad() {
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
    let { pageNum, pageSize, list } = this.data;

    if (!refresh) {
      pageNum += 1;
    } else {
      pageNum = 1;
    }

    try {
      wx.showLoading({ title: '加载中...', mask: true });
      const res = await getListData(pageNum, pageSize);

      const newList = refresh ? res.data : list.concat(res.data);
      const hasMore = res.data.length >= pageSize;

      this.setData({
        list: newList,
        pageNum: pageNum,
        hasMore
      });
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      wx.hideLoading();
      wx.stopPullDownRefresh(); // 避免下拉刷新时 loading 停不掉
    }
  },

  onItemTap(e: any) {
    const id = e.currentTarget.dataset.id;
    console.log('跳转的 id 是：', id);
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
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
