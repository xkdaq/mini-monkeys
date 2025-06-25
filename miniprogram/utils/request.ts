
import CryptoJS from 'crypto-js';

const BASE_URL = 'https://api.monkeysxu.fun'; // 你自己的接口地址
const AES_KEY = CryptoJS.enc.Utf8.parse('47ccmuRaEWyYFmVn'); // 16位密钥
const AES_IV = CryptoJS.enc.Utf8.parse('K5i9TbRSthzaQ5Hm');  // 16位 IV（视后端设置）

// AES 解密函数
function aesDecrypt(encryptedBase64: string): any {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, AES_KEY, {
      iv: AES_IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    console.log('解密：', decryptedText);
    return JSON.parse(decryptedText);
  } catch (e) {
    console.log('解密失败：', e);
    throw new Error('数据解析失败');
  }
}

// 统一请求函数
function secureRequest<T>(url: string, data = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'x-version': '1'
      },
      data,
      success(res) {
        try {
          const decryptedData = aesDecrypt(res.data as string);
          resolve(decryptedData);
        } catch (e) {
          wx.showToast({ title: '数据解密失败', icon: 'none' });
          reject(e);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}

// export function getListData(pageNum: number, pageSize: number): Promise<{
//   data: {
//     title: string;
//     date: string;
//     isTop: number;
//     type: number;
//     content: string;
//   }[]
// }> {
//   console.log('请求页码：', pageNum);
//   return new Promise((resolve, reject) => {
//     wx.request({
//       url: `${BASE_URL}/api/article/list?pageNum=${pageNum}&pageSize=${pageSize}`,
//       method: 'POST',
//       success(res) {
//         if (res.data.code === 0) {
//           console.log('请求成功数据：', res.data);
//           const rawList = res.data.rows || [];
//           const formattedList = rawList.map((item: any) => ({
//             title: item.title,
//             date: item.date,
//             id: item.id,
//             isTop: item.isTop,
//             type: item.type,        // 加上 type
//             content: item.content   // 加上 content
//           }));
//           resolve({ data: formattedList });
//         } else {
//           console.log('数据获取失败');
//           wx.showToast({ title: '数据获取失败', icon: 'none' });
//           reject(res.data);
//         }
//       },
//       fail(err) {
//         console.log('网络错误');
//         wx.showToast({ title: '网络错误', icon: 'none' });
//         reject(err);
//       }
//     });
//   });
// }

export function getListData(pageNum: number, pageSize: number): Promise<{
  data: {
    title: string;
    date: string;
    id: string;
    isTop: number;
    type: number;
    content: string;
  }[]
}> {
  console.log('请求页码：', pageNum);
  return secureRequest(`/api/article/list?pageNum=${pageNum}&pageSize=${pageSize}`)
    .then((res: any) => {
      const rawList = res.rows || [];
      const formattedList = rawList.map((item: any) => ({
        title: item.title,
        date: item.date,
        id: item.id,
        isTop: item.isTop,
        type: item.type,
        content: item.content
      }));
      return { data: formattedList };
    })
    .catch((err) => {
      console.error('获取文章列表失败', err);
      throw err;
    });
}



// export function getArticleDetail(id: String): Promise<{ title: string; content: string }> {
//   return new Promise((resolve, reject) => {
//     wx.request({
//       url: `${BASE_URL}/api/article/details?id=${id}`,
//       method: 'POST',
//       success(res) {
//         if (res.data.code === 0 && res.data.data) {
//           const { title, content } = res.data.data;
//           resolve({ title, content });
//         } else {
//           wx.showToast({ title: '获取详情失败', icon: 'none' });
//           reject(res.data);
//         }
//       },
//       fail(err) {
//         wx.showToast({ title: '网络错误', icon: 'none' });
//         reject(err);
//       }
//     });
//   });
// }


export function getArticleDetail(id: string): Promise<{ title: string; content: string }> {
  return secureRequest(`/api/article/details?id=${id}`)
    .then((res: any) => {
      if (res && res.data.title && res.data.content) {
        return {
          title: res.data.title,
          content: res.data.content
        };
      } else {
        wx.showToast({ title: '获取详情失败', icon: 'none' });
        return Promise.reject(new Error('数据格式异常'));
      }
    })
    .catch(err => {
      wx.showToast({ title: '网络错误', icon: 'none' });
      return Promise.reject(err);
    });
}


// export function getArticleList(pageNum: number, pageSize: number, keywords?: string): Promise<{ data: { title: string; date: string; isTop: number }[] }> {
//   return new Promise((resolve, reject) => {
//     wx.request({
//       url: `${BASE_URL}/api/article/list?pageNum=${pageNum}&pageSize=${pageSize}&keywords=${keywords}`,
//       method: 'POST',
//       success(res) {
//         if (res.data.code === 0) {
//           console.log('请求成功数据：', res.data);
//           const rawList = res.data.rows || [];
//           const formattedList = rawList.map((item: any) => ({
//             title: item.title,
//             date: item.date,
//             id: item.id,
//             isTop: item.isTop,
//           }));
//           resolve({ data: formattedList });
//         } else {
//           console.log('数据获取失败');
//           wx.showToast({ title: '数据获取失败', icon: 'none' });
//           reject(res.data);
//         }
//       },
//       fail(err) {
//         console.log('网络错误');
//         wx.showToast({ title: '网络错误', icon: 'none' });
//         reject(err);
//       }
//     });
//   });
// }

export function getArticleList(
  pageNum: number,
  pageSize: number,
  keywords = ''
): Promise<{ data: { title: string; date: string; id: string; isTop: number }[] }> {
  const query = `/api/article/list?pageNum=${pageNum}&pageSize=${pageSize}&keywords=${encodeURIComponent(keywords)}`;

  return secureRequest(query)
    .then((res: any) => {
      const rawList = res.rows || [];
      const formattedList = rawList.map((item: any) => ({
        title: item.title,
        date: item.date,
        id: item.id,
        isTop: item.isTop,
      }));
      return { data: formattedList };
    })
    .catch((err) => {
      wx.showToast({ title: '加载失败', icon: 'none' });
      return Promise.reject(err);
    });
}