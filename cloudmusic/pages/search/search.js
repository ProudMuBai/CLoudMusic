import * as request from '../../utils/request'
let  timer = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '', //placeholder的内容
    hostList: [],//热搜榜数据
    searchContent: '',//用户输入的表单项数据
    searchList: [],//keyword关键字对应的数据详情列表
    historyList:[], //用户搜索的历史记录数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取初始化的数据
    this.getInitData();
    //获取历史记录数据
    this.getSearchHistory();
  },

  //获取初始化数据
  async getInitData(){
    let placeholderData = await request.default('/search/default');
    let hostListData = await  request.default('/search/hot/detail');
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hostList: hostListData.data,
    });
  },

  //搜索框input内容发生改变的回调
  handleInputChange(event){
    if(!event.detail.value.trim()){
      return;
    }
    //更新searchContentd的状态数据
    this.setData({
      searchContent: event.detail.value.trim()
    });
    //函数防抖设置延时触发方法
    clearTimeout(timer);//重复调用时先清除计时器
    timer = setTimeout(()=>{
      this.getSearchList();
    },300);

  },

  //获取搜索关键字对应的数据的函数
  async getSearchList(){
    //如果keyword关键字为空,则直接返回不发送请求
    if (!this.data.searchContent){
      this.setData({
        searchList: []
      })
      return;
    }
    //发送获取关键字模糊匹配数据
    let searchListData = await  request.default('/cloudsearch',{keywords: this.data.searchContent,limit: 10});
    this.setData({
      searchList: searchListData.result.songs
    })
    //调用添加历史记录函数
    this.historyStorage();
  },

  //存储用户搜索的历史记录
  historyStorage(){
    let {historyList,searchContent} = this.data;
    let index = historyList.indexOf(searchContent);
    if( index !== -1){
      historyList.splice(index,1);
    }
    historyList.unshift(searchContent);

    this.setData({
      historyList
    });
    //存储用户的历史记录到本地
    wx.setStorageSync('searchHistory', historyList);
  },

  //获取历史记录数据的功能函数
  getSearchHistory(){
    let historyList = wx.getStorageSync('searchHistory');
    if (historyList){
      this.setData({
        historyList
      })
    }
  },

  //清空搜索内容
  clearSearchContent(){
    this.setData({
      searchContent: '',
      searchList: [],
    })
  },

  //删除历史记录的回调
  deleteSearchHistory(){
    wx.showModal({
      title: '历史记录',
      content: '确认删除?',
      success: (res) => {
        if (res.confirm){
          //清空data中的historyList
          this.setData({
            historyList: [],
          });
          //移出本地的历史记录缓存
          wx.removeStorageSync('searchHistory');
        }
      }
    });
  },

  //点击搜索到的歌曲跳转到播放界面播放对应的歌曲
  handleSearchSong(event){
    let {songid} = event.currentTarget.dataset;
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