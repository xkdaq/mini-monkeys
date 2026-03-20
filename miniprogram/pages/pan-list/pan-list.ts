// pages/pan-list/pan-list.ts

import { getWangpanData } from '../../utils/request';

// 在 Page 外定义，避免每次点击都创建新实例
let videoAd: WechatMiniprogram.RewardedVideoAd | null = null;

Page({
  data: {
    keywords: '',
    placeholder: '请输入资料名称进行搜索',
    list: [] as {
      id: string;
      title: string;
      date: string;
      isTop: number;
      type: number;
      content: string;
      categoryList: string[];
    }[],
    pageNum: 1,
    pageSize: 12,
    hasMore: true,
    loadingMore: false,
    isLoading: false,
    pendingId: null,
    pendingType: null
  },

  onLoad() {
    this.initAd();
    this.loadList(true);
  },

  initAd() {
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-3de68786b5ee28bd'
      });

      videoAd.onLoad(() => {
        console.log('广告加载成功');
      });

      videoAd.onError((err) => {
        console.error('广告加载错误', err);
      });

      videoAd.onClose((res) => {
        if (res && res.isEnded) {
          console.log('用户完整观看广告，允许跳转');
          wx.navigateTo({
            url: `/pages/detail/detail?id=${this.data.pendingId}&type=${this.data.pendingType}`
          });
        } else {
          wx.showToast({
            title: '需要完整观看广告才能查看内容',
            icon: 'none'
          });
        }
      });
    }
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
    let { pageNum, pageSize, list } = this.data;

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

      const res = await getWangpanData(pageNum, pageSize);
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

    this.setData({
      pendingId: id,
      pendingType: type
    });

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
    } else if (type === 5 && videoAd) {
      wx.showModal({
        title: '提示',
        content: '观看一段广告，即可获得资源',
        confirmText: '观看广告',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            videoAd?.show().catch(() => {
              videoAd!.load().then(() => videoAd!.show());
            });
          }
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
      url: '/pages/search/search?from=wangpan'
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
