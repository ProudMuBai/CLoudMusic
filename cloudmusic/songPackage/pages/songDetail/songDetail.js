import PubSub from 'pubsub-js';
import moment from 'moment';

import * as request from '../../../utils/request'
//获取app.js中的全局实例
const appInstance = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,//当前音乐播放状态,默认为false
    song: {},//当前歌曲详情数据
    lyric: [],//当前歌曲的歌词文本对象
    currentTime: '00:00',//当前监听到的播放时间进度
    durationTime: '00:00',//音乐总时长
    musicLink: '',//当前播放的音乐链接
    currentLyric: {},//当前播放的歌词片段
    sliderValue: '',//音乐播放实时进度
    time: '',//动画过渡时间
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options用于接收路由跳转时携带的参数
    this.getMusicInfo(options.MusicId);

    //判断当前页面音乐是否在播放   //如果对应id的歌曲的全局状态为true修改当前页面的音乐播放状态为true
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === options.MusicId) {
      this.setData({
        isPlay: true
      })
    }
    //创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    //监听音乐播放/暂停/停止
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true);
      appInstance.globalData.musicId = options.MusicId;
    });
    this.backgroundAudioManager.onPause(() => this.changePlayState(false));
    this.backgroundAudioManager.onStop(() => this.changePlayState(false));

    //音乐播放进度更新事件
    this.backgroundAudioManager.onTimeUpdate(() => {
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss');
      let sliderValue = this.backgroundAudioManager.currentTime /this.backgroundAudioManager.duration * 100;
      // this.data.lyric.forEach(item => {
      //   if (Math.ceil(this.backgroundAudioManager.currentTime) == item.time) {
      //     this.setData({
      //       currentLyric: item
      //     })
      //     return item;
      //   }
      // });
     if (Math.ceil(this.backgroundAudioManager.currentTime)>5){
       let {lyric} = this.data;
       lyric.forEach(item => {
         if (Math.ceil(this.backgroundAudioManager.currentTime) == item.time) {
           if(item.index<lyric.length-1){
             let next = lyric[item.index+1];
             let time = next.time - item.time
             this.setData({
               currentLyric: item,
               time
             })
           }
           return ;
         }
       });
     }



      this.setData({
        currentTime,
        sliderValue
      });
      // this.setCurrentLyric(currentTime)
    });

    //监听音乐自然播放结束
    this.backgroundAudioManager.onEnded(() => {
      //发布切换歌曲的类型next,自动播放下一首
      PubSub.publish('switchType','next');
      this.setData({
        sliderValue: 0,
        currentTime: '00:00',
      })
    });

  },

  //修改音乐播放状态的功能函数
  changePlayState(isPlay){
    //修改音乐的播放状态
    this.setData({
      isPlay
    })
    //续费全局音乐播放的状态
    appInstance.globalData.isMusicPlay = isPlay;
  },

  //点击播放/暂停的回调
  handleMusicPlay(){
    let isPlay = !this.data.isPlay;
    //isPlay状态值更新交给backgroundAudioManager监听事件完成
    this.musicControl(isPlay,this.data.musicLink);
  },

  //获取音乐详情的功能函数
  async getMusicInfo(musicId){
    let songData = await request.default('/song/detail',{ids: musicId});
    let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    this.setData({
      song: songData.songs[0],
      durationTime
    })
    this.getMusicLyric();
  },

  //控制音乐播放暂停的函数
  async musicControl(isPlay,musicLink){
    let {song} = this.data;
    if (isPlay){
      //musicLink为空时  获取音乐链接
      if(!musicLink){
        let musicLinkData = await request.default('/song/url',{id: song.id});
        musicLink = musicLinkData.data[0].url;
        this.setData({
          musicLink
        })
      }
      this.backgroundAudioManager.src = this.data.musicLink;
      this.backgroundAudioManager.title = song.name;
    }else{
      this.backgroundAudioManager.pause();
    }
  },

  //获取当前歌曲的歌词
  async getMusicLyric(){
    let lyricData = await request.default('/lyric',{id: this.data.song.id});
    let  lyric = this.formatLyric(lyricData.lrc.lyric);
    this.setData({
      lyric,
    })
  },

  //对lyricData格式歌词文本进行处理的函数
  formatLyric(lyric){
    let result = [];
    let ArrLyric = lyric.split('\n'); //对原歌词以空格进行分片
    ArrLyric.pop()
    //获取歌词的行数,对数组进行遍历操作
    let index = 0;
    ArrLyric.map(item =>{
      let temp = item.split("]");
      let text = temp.pop();//删除并返回当前行的歌词文本内容
      //对剩下的时间部分进行处理
      let ArrTime = temp[0].substr(1).split(':');
      //let time = parseFloat(ArrTime[0]*60+parseFloat(ArrTime[1])).toFixed(3);
      let time = parseInt(ArrTime[0]*60+Math.ceil(ArrTime[1]));
      result.push({time,text,index});
      index ++;
    })
    //定义排序规则 --> 对返回的数组元素进行升序排序,
    result.sort((a,b) =>{return a.time - b.time});
    return result;
  },

  //更新正在播放的音乐歌词 --->实现效果不理想,已弃用
  setCurrentLyric(currentTime){
    let {lyric} = this.data;
    let currentLyric = lyric.find(item =>{
      if (Math.ceil(item.time) == currentTime){
        return item;
      }
    })
    if (currentLyric && currentLyric.time != this.data.currentLyric.time){
      console.log(currentLyric)
      if(lyric.indexOf(currentLyric)>2){
        let temp = lyric.shift();
        lyric.push(temp);
        this.setData({
          currentLyric,
          lyric,
        })
        return ;
      }
      this.setData({
        currentLyric,
      })
    }
  },

  //点击切换歌曲的回调
  handleSwitch(event){
    //获得点击切换歌曲的回调
    let type = event.currentTarget.id;
    this.backgroundAudioManager.stop();
    //订阅来自recommendSong页面发布的切换后的音乐id信息
    PubSub.subscribe('musicId',async (msg,musicId)=>{
      //获取切换后的音乐详情
      await this.getMusicInfo(musicId);
      //自动播放当前音乐
      this.musicControl(true);
      //接收后取消订阅,避免多次订阅造成回调累积
      PubSub.unsubscribe('musicId');
    });
    //PubSub异步发布消息
    PubSub.publish('switchType',type);
  },


  //点击歌词跳转到对应播放时间的回调
  handleChangeLyric(event){
    this.backgroundAudioManager.pause();
    let currentTime = event.currentTarget.dataset.time;
    let sliderValue = currentTime/this.backgroundAudioManager.duration*100;
    this.backgroundAudioManager.seek(currentTime);
    this.setData({
      sliderValue,
      currentTime
    })
    this.backgroundAudioManager.play();
  },


  //点击进度条跳转到当前播放位置
  handleSeek(event){
    this.backgroundAudioManager.pause();
    let {value} = event.detail;
    let currentTime = this.backgroundAudioManager.seek(value*this.backgroundAudioManager.duration/100);
    this.setData({
      sliderValue: value,
      currentTime
    })
    this.backgroundAudioManager.play();
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