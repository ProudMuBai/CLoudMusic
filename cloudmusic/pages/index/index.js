// pages/index/index.js
import request from "../../utils/request";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    biannerList: [],//轮播图数据对象数组
    recommendList: [],//推荐歌单数据
    topList: [],//排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    //获取轮播图相关数据
    let bannerListData = await request('/banner',{type: 2});
    this.setData({
      bannerList: bannerListData.banners
    })

    let recommendListData = await request('/personalized',{limit: 10})
    this.setData({
      recommendList: recommendListData.result
    })

    /**
     * 需求分析
     * 1.需要根据idx的值获取对应的数据
     * 2.idx的取值范围是0~20,但页面只需要0~4
     * 3.需要发送五次请求
     */
    let topListData = await request('/toplist/detail');
    topListData = topListData.list.splice(0,5);
    let topList =[];
    let index =0;
    while (index <5){
      let topListItem = await request('/playlist/detail',{id: topListData[index++].id});
      topListItem = {name: topListItem.playlist.name,tracks: topListItem.playlist.tracks.slice(0,3)}
      topList.push(topListItem);
    }
    //更新toplist的状态值,在循环内更新防止白屏时间过长影响用户体验
    this.setData({
      topList
    })

  },

  //跳转到歌曲列表页
  toRecommendSong(){
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong'
    })
  },
  
  //跳转到token请求页面
  toOther(){
    wx.navigateTo({
      url: '/otherPackage/pages/other/other'
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