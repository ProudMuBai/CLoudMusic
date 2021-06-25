// pages/recommendSong/recommendSong.js
import PubSub from 'pubsub-js';
import * as request from '../../../utils/request'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: {},//日期存储对象
    recommendSongs: [], //推荐歌曲列表
    index: 0,//点击播放的歌曲对应的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断用户是否登录
    request.userIsLogin();
    //获取当前系统日期时间
    this.showDate();
    //获取推荐歌曲列表
    this.getRecommendSongs();

    //订阅来自songDetail页,页面发布的切换歌曲信息
    PubSub.subscribe('switchType',(msg,type)=>{
      let {recommendSongs,index} = this.data;
      if (type === 'pre'){//切换上一首歌曲
        (index ===0) && (index =recommendSongs.length)
        index -= 1;
      }else{//切换下一首
        (index === recommendSongs.length -1) && (index = -1)
        index +=1;
      }
      let musicId = recommendSongs[index].id;
      //将musicId发布给songDetail页面
      PubSub.publish('musicId',musicId);
      //更新index 下标的值
      this.setData({
        index
      });
    });
  },

  //获取用户每日推荐数据
  async getRecommendSongs(){
    let recommendSongs = await request.cookieRequest('/recommend/songs');
    this.setData({
      recommendSongs: recommendSongs.data.dailySongs
    })
  },

  //显示当前时间的函数
  showDate(){
    let now = new Date();
    let minute = now.getMinutes()<10? `0${now.getMinutes()}`:now.getMinutes();
    let time = `${now.getHours()}:${minute}`;
    let daytime = `${now.getFullYear()} 年 ${now.getMonth()+1} 月 ${now.getDate()} 日`
    let loadingTimeId = setTimeout(()=>{
      this.showDate()
    },60000)
    let date={id:loadingTimeId, time,daytime};
    this.setData({
      date,
    })
  },

  //点击歌曲对应的回调
  toSongDetail(event){
    let {songid,index} = event.currentTarget.dataset;
    this.setData({
      index
    })
    wx.navigateTo({
      url: '/songPackage/pages/songDetail/songDetail?MusicId='+songid
    })
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
    clearTimeout(this.data.loadingTimeId)
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