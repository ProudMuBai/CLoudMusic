// pages/video/video.js
import * as request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [],//导航标签栏数据
    navId: '',//导航的标识
    videoList: [],//视频列表对象
    videoUrl: '',//当前播放的视频url
    videoUpdateTime: [],//用户播放时长进度
    isTriggered: false, //标识下拉刷新是否被触发
    pageNum: 0, //offset分页参数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断用户是否登录
    request.userIsLogin();
    //调用getVideoGroupListData获取导航标签数据
    this.getVideoGroupListData();
  },

  //获取导航标签数据
  async getVideoGroupListData(){
    let videoGroupListData = await request.default("/video/group/list");
    let videoGroupList = [];
    videoGroupListData.data.find(item=>{
      if (item.id!=258122&&item.id!=262158){
       videoGroupList.push(item);
      }
      return;
    })
    this.setData({
      videoGroupList: videoGroupList.slice(0,12),
      navId: videoGroupListData.data[0].id
    })
    //获取视频列表数据
    this.getVideoList(this.data.navId);
  },

  //获取视频列表数据
  async getVideoList(navId){
    if(!navId){
      return;
    }
    let videoListData = await request.cookieRequest('/video/group',{id: navId});
    //关闭消息提示框
    wx.hideLoading();
    let index=0;
    let videoArr= [];
    let videoList = videoListData.datas.map(item =>{
      item.id = index++;
      // this.getMovieUrl(item,videoArr);
      return item;
    })
    this.setData({
      videoList,
      isTriggered: false,
    })
  },

  //添加视频列表
  async getOnepageVideoList(flag){
    let offset = this.data.pageNum;
    let newvideoList = await request.cookieRequest('/video/group',{id: this.data.navId ,offset: ++offset});
    let {videoList} = this.data;
    flag?videoList.unshift(...newvideoList.datas):videoList.push(...newvideoList.datas);
    let index = 0;
    videoList.map(item => {
      item.id = index++;
      return item;
    })
    let  length = newvideoList.datas.length*2;
    videoList =  flag?videoList.splice(0,length):videoList.splice(videoList.length -length,videoList.length);
    this.setData({
      videoList,
      pageNum: offset,
      isTriggered: false,
    })
  },

  /*获取视频播放源Url
  async getMovieUrl(list,videoArr){
    let url = await request.default('/video/url',{id: list.data.vid});
    let variate ='';
    url.urls.map(item =>{ variate= item.url;});
    list.data.MovieUrl=variate;
    videoArr.push(list)
    this.setData({
      videoList: videoArr
    })
  },*/
  async getMovieUrl(vid){
    let videoData = await request.default('/video/url',{id: vid});
    let videoUrl = {};
    videoData.urls.map(item=>{
      videoUrl = item;
    })
    this.setData({
      videoUrl
    })
  },

  //点击切换导航的回调
  changeNav(event){
    let navId = event.currentTarget.dataset.id;
    this.setData({
      navId,
      videoList: []
    })
    //显示正在加载的弹窗
    wx.showLoading({
      title: '加载中'
    })
    //动态获取当行对应的视频数据
    this.getVideoList(this.data.navId)
  },

  //点击渲染视频 自动播放/继续的回调
  handlePlay(event){
    /**
     * BUG:多个视频同时播放,需要在播放视频的同时关闭上一个视频
     * Case: 1.找到上一个视频的实例对象
     *       2.确认上一个播放的视频是不是桶一个
     */
    let vid = event.currentTarget.id;
    //this.data.videoUrl.id !== vid && this.getMovieUrl(vid) ,this.videoContext = wx.createVideoContext(vid);
    this.data.videoUrl.id !== vid && this.getMovieUrl(vid) ,this.videoContext = wx.createVideoContext(vid);

    // //关闭上一个播放的视频
    //this.vid !==vid && this.videoContext && this.videoContext.stop();
    // // //将当前对象的vid保存
    //this.vid = vid;
    //创建当前对象的上下文对象
    //判断当前视频之前是否播放过,是否有播放记录,如果有,跳转至指定的播放位置
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid ===vid);
    if(videoItem){
      this.videoContext.seek(videoItem.currentTime);
    }
  },

  //视频播放进度的回调
  handleTimeUpdate(event){
    let videoTimeObj = {vid: event.currentTarget.id,currentTime: event.detail.currentTime}
    let {videoUpdateTime} =this.data;
    /**
     * 判断播放记路中是否有当前视频的播放记录
     * 1.有  =>在原有订单播放记录中修改播放时间为当前播放时间
     * 2.无 => 在数组中添加当前视频的播放对象
     */
    let videoItem = videoUpdateTime.find(item =>item.vid===videoTimeObj.vid);
    if (videoItem){//已经存在播放记录
      videoItem.currentTime = event.detail.currentTime;
    }else{//首次播放
      videoUpdateTime.push(videoTimeObj)
    }
    //更新videoUpdateTime的状态
    this.setData({
      videoUpdateTime
    })
  },

  //视频播放结束的回调
  handleEnded(event){
    //播放结束,移出记录播放时长数组中当前视频的对象
    let {videoUpdateTime} = this.data
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id),1);
    this.setData({
      videoUpdateTime
    })
  },

  //视频列表下拉刷新的回调
  handleSherRefresh(){
    let  flag = 'fresh';
    this.getOnepageVideoList(flag);
  },

  //页面底部触底
  handleScrolltolower(){
    this.getOnepageVideoList();
  },

  //跳转到搜索界面的路由
  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search'
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
  onShareAppMessage: function ({from}) {
    let userInfo = wx.getStorageSync('userInfo');
    userInfo = JSON.parse(userInfo);
    if (from =='button'){
      return {
        title: `来自${userInfo.nickname}的分享`,
        page: '/pages/video/video',
        imageUrl: userInfo.avatarUrl
      }
    }else{
      return {
        title: `来自${userInfo.nickname}的分享`,
        page: '/pages/video/video',
      }
    }
  }
})