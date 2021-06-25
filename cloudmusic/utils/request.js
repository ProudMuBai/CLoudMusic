
import config from "./config";
export default (url,data={},method='GET') =>{
    return new Promise((resolve,reject) =>{
        //1.new Promise初始化promise实例的状态为pending
        wx.request({
            url: config.host + url,
            data,
            method,
            success: (res)=>{
              resolve(res.data);//resolve修改promise状态为成功
            },
            fail: (err) =>{
                reject(err);//reject修改promise状态为失败
            }
        })
    })
}

export function cookieRequest(url,data={},method='GET'){
    return new Promise((resolve,reject) =>{
        //1.new Promise初始化promise实例的状态为pending
        wx.request({
            url: config.host + url,
            data,
            method,
            header: {
                cookie: wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(itemc =>itemc.indexOf('MUSIC_U') !== -1) : ''
            },
            success: (res)=>{
                //判断是否是登录请求 ;
                if (data.isLogin){
                    //是: 将用户cookie信息存储至置本地
                    wx.setStorage({
                      key:"cookies",
                      data:res.cookies
                    })
                }
                resolve(res.data);//resolve修改promise状态为成功
            },
            fail: (err) =>{
                reject(err);//reject修改promise状态为失败
            }
        })
    })
}


//判断用户是否登录
export function userIsLogin(){
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo){
        wx.showToast({
            title: '请先登录',
            icon: 'none',
            success: () =>{
                //跳转到登录界面
                wx.reLaunch({
                    url: '/pages/login/login'
                })
            }
        })
    }
}