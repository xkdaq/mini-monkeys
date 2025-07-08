// pages/detail/detail.ts

import { getArticleDetail } from '../../utils/request';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    webviewUrl: '',
    type: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const id = options?.id;
    const type = Number(options?.type || 0);
    console.log('拿到的 id 是：', id);
    this.setData({ type });

    if (id) {
      try {
        const res = await getArticleDetail(id);
        console.log('res.title 是：', id);
        console.log('res.content 是：', id);
        this.setData({
          title: res.title,
          htmlContent: res.content
        });
      } catch (e) {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    }
  },

  onLinkTap(e: any) {
    const link = e.detail.href;
    if (link.startsWith('http')) {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(link)}`
      });
    } else {
      wx.showToast({ title: '暂不支持的链接', icon: 'none' });
    }
  },

  onCopyContent() {
    // const { htmlContent } = this.data;

    // // 如果 htmlContent 可能是 HTML，就去除标签；否则直接复制原内容
    // const isHTML = /<\/?[a-z][\s\S]*>/i.test(htmlContent);
    // const plainText = isHTML ? htmlContent.replace(/<[^>]+>/g, '') : htmlContent;

    // if (!plainText.trim()) {
    //   wx.showToast({ title: '内容为空，无法复制', icon: 'none' });
    //   return;
    // }

    // wx.setClipboardData({
    //   data: plainText,
    //   success() {
    //     wx.showToast({ title: '复制成功', icon: 'success' });
    //   },
    //   fail(err) {
    //     console.error('复制失败:', err);
    //     wx.showToast({ title: '复制失败', icon: 'none' });
    //   }
    // });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 分享好友
   */
  onShareAppMessage() {
    return {
      title: this.data.title || '猴哥星球'
    };
  },

  /**
   * 分享朋友圈
   */
  onShareTimeline() {
    return {
      title: this.data.title || '猴哥星球'
    };
  }
})