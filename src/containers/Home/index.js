import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import axios from 'axios'
import cnames from 'classnames'

import './home.scss'
import config from '../../utils/config.js'
import Register from '../Register'
import Login from '../Login'
import AppHeader from '../../components/Header'
import Slide from './subpage/Slide'
import SmaillType from './subpage/SmaillType'

class Home extends Component {
	constructor(props) {
		super();
		this.state = {
			navTop: ['超市', '会员', '电器城', '鲜生', '医药馆', '营业厅', '旅行', '图书'],
			// 大分类信息
			bigType:[],
			selectedBigid: -1 // -1 不展示，其他为 bigType的 id
		}
		this.onBigTypeSelect = this.onBigTypeSelect.bind(this);
		this.CurrentSmaillType = this.CurrentSmaillType.bind(this);
	}
	componentWillMount() {
		// 获取大分类表中数据
		axios.get(config.HOST + '/api/goods/type?type=big&limit=16')
			.then(res => {
				if (!res.data.success) {
					return console.error('商品分类列表获取失败');
				}
				this.setState({
					bigType: res.data.payload
				});
			})
			.catch(err => {
				console.error(err);
			});
	}
	componentDidMount() {
		
	}
	
	// 设置或获取 state的bigType 的 smaillType
	CurrentSmaillType(bigid, smaillType, getSmaill = false) {
		var bigType = this.state.bigType;
		if (bigType.length === 0) return;
		
		for (var i = 0,len = bigType.length; i < len; i++) {
			if (bigType[i]._id === bigid) {
				// 获取smaillType
				if (getSmaill) {
					return bigType[i].smaillType;
				}
				// 设置 smaillType
				bigType[i].smaillType = smaillType;
				this.setState({
					bigType: bigType
				});
			}
		}
	}
	onBigTypeSelect(e) {
		// showsmaill => true
		var bigid = Number(e.currentTarget.getAttribute('bigid'));
		this.setState({
			selectedBigid:bigid
		});
		axios.get(config.HOST + '/api/goods/type?type=smaill&bigid=' + bigid)
			.then(res => {
				if (!res.data.success) return;
				this.CurrentSmaillType(bigid, res.data.payload);
			})
			.catch(err => {
				console.error(err);
			});
	}
	onBigTypeLeave(){
		this.setState({selectedBigid: -1});
	}
	render() {
		return (
			<div>
				<AppHeader />
				<div className="headerCon">
					<form>
						<input 
							type="text"
							className="search-text"
							placeholder="搜索 优选 商品/品牌/店铺"
						/>
						<button className="search-btn">搜索</button>
					</form>
					<ul className="hot-query">
					{/*搜索框下面展示*/}
					{
						this.state.navTop.map((item,index) => {
							return (
								<li key={index}>
									<Link to="/">{item}</Link>
								</li>
							)
						})
					}
					</ul>
				</div>
				<div className="main-nav">
					<ul className="nav-t-wrap">
						{
							this.state.navTop.map((item, i) => {
								return (<li key={i}>{item}</li>)
							})
						}
					</ul>
					{/*商品主分类*/}
					<div className="nav-l-box">
						<div className="main-logo-wrap">
							<div>
								<a href={config.HOST}>
									<img width="240px" height="130px" src={config.HOST + "/image/ui/home_logo.png"} alt="优选"/>
								</a>
							</div>
						</div>
						<div className="nav-l-wrap" onMouseLeave={this.onBigTypeLeave.bind(this)}>
							<div className="nav-l-title">商品分类</div>
							<div className="nav-l-typewrap">
							{
								this.state.bigType.map(item => (
									<div 
										key={item._id} 
										className={cnames("nav-l-item", {
											'nav-l-item-sel': this.state.selectedBigid===item._id
										})}
										bigid={item._id}
										onMouseOver={this.onBigTypeSelect}
									>{item.bigName}</div>
								))
							}
							</div>
							{
								this.state.selectedBigid === -1 ? null :
								<SmaillType smaillType={this.CurrentSmaillType(this.state.selectedBigid,null,true)} />
							}
						</div>
					</div>
					{/*轮播图组件，传递slideImg图片组*/}
					<Slide />
				</div>
			</div>
		)
	}
}

export default Home;