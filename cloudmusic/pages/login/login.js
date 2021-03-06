// pages/login/login.js
import * as request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    password: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //表单内容发生改变的回调
  handleInput(event){
    let type = event.currentTarget.dataset.type; //id取值 : phone/passwd
    this.setData({
      [type]: event.detail.value
    })

  },
  async login(){
    //1.收集表单数据
    let {phone,password} = this.data;
    //2.前端验证
    /**
     * 手机号验证:
     *  1.内容为空
     *  2.手机号格式不正确
     */
    if (!phone){
      wx.showToast({
        title: '账号不能为空',
        icon: 'error'
      })
      return;
    }
    //校验密码是否符号规则
    let phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)){
      wx.showToast({
        title: '账号格式错误',
        icon: 'error'
      })
      return;
    }
    //校验密码是否为空
    if (!password){
      wx.showToast({
        title: '密码不能为空',
        icon: 'error'
      })
      return;
    }

    //后端验证
    let result = await request.cookieRequest('/login/cellphone',{phone,password,isLogin: true},'POST');
    if (result.code === 200){
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      //将用户的信息存储至本地
      wx.setStorageSync('userInfo', JSON.stringify(result.profile));
      //跳转值个人中心personal页面
      wx.reLaunch({
        url: '/pages/personal/personal'
      })
    }else if(result.code ===400){
      wx.showToast({
        title: '账号不存在',
        icon: 'none'
      })
    }else if(result.code === 502){
      wx.showToast({
        title: '密码错误',
        icon: 'none'
      })
    }else{
      wx.showToast({
        title: '登录失败,请稍后再试',
        icon: 'none'
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})