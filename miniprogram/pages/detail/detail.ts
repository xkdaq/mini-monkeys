// pages/detail/detail.ts

import { getArticleDetail } from '../../utils/request';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    webviewUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const id = options?.id;
    console.log('拿到的 id 是：', id);
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
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})