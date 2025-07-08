// pages/search/search.ts

import { getSearchList } from '../../utils/request';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    from: '',
    keywords: '',
    placeholder: '请输入完整高校名称进行搜索',
    list: [],
    pageNum: 1,
    pageSize: 12,
    hasMore: true,
    loadingMore: false
  },

  onInputChange(e: any) {
    this.setData({ keywords: e.detail.value });
  },

  onLoad(options) {
    const from = options.from || '';
    let placeholder = '请输入完整高校名称进行搜索';
    if (from === 'wangpan') {
      placeholder = '请输入资料名称进行搜索';
    }
    this.setData({
      from:from,
      placeholder:placeholder
    });
  },

  async onSearch() {
    this.setData({ pageNum: 1, hasMore: true });
    await this.loadList(true);
    wx.stopPullDownRefresh();
  },

  async onPullDownRefresh() {
    this.setData({ pageNum: 1, hasMore: true });
    await this.loadList(true);
    wx.stopPullDownRefresh();
  },

  async onReachBottom() {
    console.log('onReachBottom1');
    if (!this.data.hasMore || this.data.loadingMore) return;
    console.log('onReachBottom2');
    this.setData({ loadingMore: true });
    await this.loadList(false);
    this.setData({ loadingMore: false });
  },

  async loadList(refresh: boolean) {
    let { pageNum, pageSize, list, keywords, from } = this.data;
    if (!keywords.trim()) return;

    if (!refresh) {
      pageNum += 1;
    } else {
      pageNum = 1;
    }

    try {
      wx.showLoading({ title: '加载中...', mask: true });
      const res = await getSearchList(pageNum, pageSize, keywords, from);

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
      wx.stopPullDownRefresh(); // 避免下拉刷新时 loading 停不掉
    }
  },

  onItemTap(e: any) {
    const item = e.currentTarget.dataset.item;
    const { id, type, content } = item;
    console.log('跳转的 id 是：', id);
    const isHTML = /<\/?[a-z][\s\S]*>/i.test(content);
    const contentNew = isHTML ? content.replace(/<[^>]+>/g, '') : content;
    if (type === 1) {
      //1 打开外部链接
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(contentNew)}`
      });
    } else if (type === 3) {
      //3 打开其他小程序
      wx.navigateToMiniProgram({
        appId: contentNew, // 👈 直接使用 item.content
        path: '',       // 可选，目标小程序内路径
        success() {
          console.log('跳转成功');
        },
        fail(err) {
          console.error('跳转失败', err);
          wx.showToast({ title: '跳转失败', icon: 'none' });
        }
      });
    } else {
      //0 跳转到详情页面  4网盘链接 复制按钮（待做）
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}&type=${type}`
      });
    }
  }
})