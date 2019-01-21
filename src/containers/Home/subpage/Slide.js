/**
 * 轮播图组件
 */
import React,{Component} from 'react'
import PropTypes from 'prop-types'
import cnames from 'classnames'
import config from '../../../utils/config'


class slide extends Component {
	constructor(props) {
		super();
		this.state = {
			slideboxs: null,
			// 轮播图图片
			slideImg: [
				{bgimg: '/image/slide_wall/TB1FmwTvHZnBKNjSZFGSuvt3FXa.jpg', bgcolor: '#fff'},
				{bgimg: '/image/slide_wall/红米Note7.webp', bgcolor: '#00f'},
				{bgimg: '/image/slide_wall/O1CN01Tms3Pn1D7tpGbFK5a_!!170-0-luban.jpg_q100.jpg_.webp', bgcolor: '#00f'},
				{bgimg: '/image/slide_wall/TB1wbKtvIfpK1RjSZFOSuu6nFXa.jpg', bgcolor: '#06f'},
				{bgimg: '/image/slide_wall/TB1wbKtvIfpK1RjSZFOSuu6nFXa.jpg', bgcolor: '#06f'},
				{bgimg: '/image/slide_wall/TB10lfQxpzqK1RjSZSgSuwpAVXa.jpg', bgcolor: '#dff'}
			],
			slideStop: false,  // 是否停止轮播图
			slideIndex: 0,  // 轮播图索引
			slideInterval: -1  // 主定时器
		}
		this.slideAnimate = this.slideAnimate.bind(this);
		this.gotoSlide = this.gotoSlide().bind(this);
		this.slideStart = this.slideStart.bind(this);
		this.slideStop = this.slideStop.bind(this);
	}
	componentDidMount() {
		// 组件挂载完毕,获取轮播图组件，开启轮播图
		this.setState({
			slideboxs: window.document.getElementsByClassName("slide-img-box")
		}, () => {
			this.state.slideboxs[this.state.slideIndex].style.opacity = 1;
			var _this = this;
			var slideInterval = window.setInterval(function(){
				if (!_this.state.slideStop)
					_this.slideAnimate();
			}, 5000);
			this.setState({
				slideInterval
			});
		});
	}
	// 组件卸载
	componentWillUnmount() {
		// 清除轮播图主定时器
		window.clearInterval(this.state.slideInterval);
	}
	// 动画切换函数，before 消失，next 显示
	slideAnimate(next) {
		var before = this.state.slideIndex;
		if (next === undefined) {next = ((before + 1) % this.state.slideboxs.length)};
		var _this = this;
		var slideboxs = this.state.slideboxs;
		var beforeOpa = 1,nextOpa = 0;
		// 开始动画
		var interval = window.setInterval(function() {
			beforeOpa -= 0.2; nextOpa += 0.2;
			slideboxs[before].style.opacity = beforeOpa;
			slideboxs[next].style.opacity = nextOpa;
		}, 50);
		// 停止动画，完成转换
		window.setTimeout(function() {
			window.clearInterval(interval);
			slideboxs[before].style.opacity = 0;
			slideboxs[next].style.opacity = 1;
			// 更新显示索引
			_this.setState({
				slideIndex: next
			});
		}, 200);
	}
	// 切换动画索引
	gotoSlide() {
		var time = 0,timeout = null;
		return function (e) {
			window.clearTimeout(timeout);
			// this.slideStop();
			var nowtime = new Date();
			var _this = this;
			var index = Number(e.currentTarget.getAttribute('index'));
			if (nowtime - time > 500) {
				if (index !== _this.state.slideIndex)
					_this.slideAnimate(index);
					time = nowtime;
			}else {
				timeout = window.setTimeout(function(){
					if (index !== _this.state.slideIndex)
						_this.slideAnimate(index);
						time = nowtime;
				}, 300);
			}
			
		}
	}
	// 停止动画
	slideStop(){
		if (!this.state.slideStop) {
			this.setState({
				slideStop: true
			});
		}
	}
	// 开启动画
	slideStart() {
		if (this.state.slideStop) {
			this.setState({
				slideStop: false
			});
		}
	}
	render(){
		var slideImg = this.state.slideImg;
		return(
		<div className="nav-slide-wrap" onMouseLeave={this.slideStart}>
		{/*轮播图图片*/}
		{
			slideImg.map((item,index) => (
				<div key={index} className="slide-img-box" style={{backgroundColor: item.bgcolor}}>
					<div 
					className="slide-img-box-i" 
					style={{background: `url(${config.HOST}${item.bgimg}) no-repeat center`}}
					onMouseOver={this.slideStop}
					></div>
				</div>
			))
		}
			{/*小按钮*/}
			<ul className="slide-nav">
			{
				slideImg.map((_, index) => {
					return (
						<li key={index} 
							className={cnames("slide-nav-item",{
								'slide-nav-selected': index === this.state.slideIndex
							})}
							index={index}
							onMouseOver={this.gotoSlide}
						></li>
					)
				})
			}
			</ul>
		</div>
	)
	} 
}

export default slide;