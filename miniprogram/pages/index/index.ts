// index.ts
// 获取应用实例

Page({
  data: {
    days: 0
  },

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '倒计时' // 设置页面标题
    });
    this.startCountdown();
  },

  startCountdown: function () {
    const targetDate = new Date("2024-12-21").getTime(); // 目标日期
    this.updateCountdown(targetDate);
  },

  updateCountdown: function (targetTime) {
    const currentTime = new Date().getTime();
    const timeDifference = targetTime - currentTime; // 计算时间差

    if (timeDifference > 0) {
      const daysRemaining = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // 计算剩余天数
      this.setData({ days: daysRemaining });

      // 每天更新一次
      setTimeout(() => {
        this.updateCountdown(targetTime);
      }, 1000 * 60 * 60 * 24);
    } else {
      this.setData({ days: "今天就是考研日!" });
    }
  }
});
