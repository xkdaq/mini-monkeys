
import CryptoJS from 'crypto-js';

const BASE_URL = 'https://api.monkeysxu.fun'; // 你自己的接口地址
// const AES_KEY = CryptoJS.enc.Utf8.parse('47ccmuRaEWyYFmVn'); // 16位密钥
// const AES_IV = CryptoJS.enc.Utf8.parse('K5i9TbRSthzaQ5Hm');  // 16位 IV（视后端设置）

// base64 加密后的内容（可提前处理）
const encodedKey = 'NDdjY211UmFFV3lZRm1Wbg==' // '47ccmuRaEWyYFmVn' 的 base64
const encodedIv = 'SzVpOVRiUlN0aHphUTVIbQ==' // 'K5i9TbRSthzaQ5Hm' 的 base64

//小程序的版本号,从1开始支持加密请求，然后每次更新记得+1
export const API_VERSION = '4';

function decodeBase64(encoded: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Utf8.parse(CryptoJS.enc.Base64.parse(encoded).toString(CryptoJS.enc.Utf8));
}

const AES_KEY = decodeBase64(encodedKey);
const AES_IV = decodeBase64(encodedIv);

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
// x-version 从1版本还是使用加密 每次审核的时候记得这个版本号
function secureRequest<T>(url: string, data = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'x-version': API_VERSION
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

//文章列表
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

//文章详情
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

//搜索页面文章列表,在文章接口新加keywords
export function getSearchList(
  pageNum: number,
  pageSize: number,
  keywords = '',
  from: string = ''
): Promise<{ data: { 
  title: string; 
  date: string; 
  id: string; 
  isTop: number;
  categoryList: string[];
}[] }> {
  let query = `/api/article/list?pageNum=${pageNum}&pageSize=${pageSize}&keywords=${encodeURIComponent(keywords)}`;
  // if (from === 'wangpan') {
  //   query += '&typeList=4,5';
  // }
  query += '&typeList=0,1,2,3,4,5';
  return secureRequest(query)
    .then((res: any) => {
      const rawList = res.rows || [];
      const formattedList = rawList.map((item: any) => ({
        title: item.title,
        date: item.date,
        id: item.id,
        isTop: item.isTop,
        type: item.type,
        categoryList: item.categoryList
      }));
      return { data: formattedList };
    })
    .catch((err) => {
      wx.showToast({ title: '加载失败', icon: 'none' });
      return Promise.reject(err);
    });
}

//网盘列表，文章列表修改，类型为4网盘免费,5网盘广告
export function getWangpanData(pageNum: number, pageSize: number): Promise<{
  data: {
    title: string;
    date: string;
    id: string;
    isTop: number;
    type: number;
    content: string;
    categoryList: string[];
  }[]
}> {
  console.log('请求页码：', pageNum);
  return secureRequest(`/api/article/list?pageNum=${pageNum}&pageSize=${pageSize}&typeList=4,5`)
    .then((res: any) => {
      const rawList = res.rows || [];
      const formattedList = rawList.map((item: any) => ({
        title: item.title,
        date: item.date,
        id: item.id,
        isTop: item.isTop,
        type: item.type,
        content: item.content,
        categoryList: item.categoryList
      }));
      return { data: formattedList };
    })
    .catch((err) => {
      console.error('获取文章列表失败', err);
      throw err;
    });
}