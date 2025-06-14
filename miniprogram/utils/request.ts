const BASE_URL = 'https://api.monkeysxu.fun'; // 你自己的接口地址

export function getListData(pageNum: number, pageSize: number): Promise<{ data: { title: string; date: string;isTop:number }[] }> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/api/article/list?pageNum=${pageNum}&pageSize=${pageSize}`,
      method: 'POST',
      success(res) {
        if (res.data.code === 0) {
          console.log('请求成功数据：', res.data);
          const rawList = res.data.rows || [];
          const formattedList = rawList.map((item: any) => ({
            title: item.title,
            date: item.date,
            id: item.id,
            isTop: item.isTop,
          }));
          resolve({ data: formattedList });
        } else {
          console.log('数据获取失败');
          wx.showToast({ title: '数据获取失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail(err) {
        console.log('网络错误');
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}

export function getArticleDetail(id: String): Promise<{ title: string; content: string }> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/api/article/details?id=${id}`,
      method: 'POST',
      success(res) {
        if (res.data.code === 0 && res.data.data) {
          const { title, content } = res.data.data;
          resolve({ title, content });
        } else {
          wx.showToast({ title: '获取详情失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}
