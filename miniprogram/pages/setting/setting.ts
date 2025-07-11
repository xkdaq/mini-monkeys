// pages/setting/setting.ts

import { API_VERSION } from '../../utils/request';

let logoClickCount = 0;
let logoClickTimer: NodeJS.Timeout | null = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    version: '',
    versionCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const accountInfo = wx.getAccountInfoSync();
    const version = accountInfo?.miniProgram?.version || '开发版';
    this.setData({
      version: version,
      versionCode: API_VERSION
    });
  },

  onLogoTap() {
    logoClickCount += 1;

    if (logoClickCount >= 2) {
      // 已点 2 次，加 1 次机会
      let count = wx.getStorageSync('viewCount') || 0;
      count -= 1;
      wx.setStorageSync('viewCount', count);

      wx.showToast({
        title: `查看次数 +1（今日可用 ${10 - count} 次）`,
        icon: 'none'
      });

      logoClickCount = 0; // 重置点击次数
      if (logoClickTimer) {
        clearTimeout(logoClickTimer);
        logoClickTimer = null;
      }
    } else {
      // 设置 2 秒内有效，否则清零
      if (logoClickTimer) clearTimeout(logoClickTimer);
      logoClickTimer = setTimeout(() => {
        logoClickCount = 0;
        logoClickTimer = null;
      }, 2000);
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