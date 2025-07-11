const MAX_VIEWS_PER_DAY = 10;

export function canViewToday(): boolean {
  const today = new Date().toDateString(); // eg: "Thu Jul 11 2025"
  const storedDate = wx.getStorageSync('viewDate');
  let viewCount = wx.getStorageSync('viewCount') || 0;

  if (storedDate !== today) {
    // 日期不同，重置
    wx.setStorageSync('viewDate', today);
    wx.setStorageSync('viewCount', 0);
    viewCount = 0;
  }

  return viewCount < MAX_VIEWS_PER_DAY;
}

export function recordView() {
  const today = new Date().toDateString();
  const storedDate = wx.getStorageSync('viewDate');
  let viewCount = wx.getStorageSync('viewCount') || 0;

  if (storedDate !== today) {
    // 新的一天，重置
    wx.setStorageSync('viewDate', today);
    viewCount = 0;
  }

  viewCount += 1;
  wx.setStorageSync('viewCount', viewCount);
}