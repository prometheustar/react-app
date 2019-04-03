import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import axios from 'axios'
import cnames from 'classnames'
import { connect } from 'react-redux'
import Lazyload from 'react-lazyload'

import { setSearchKeyAction } from '../../flux/actions/productActions'
import { alertMessageAction } from '../../flux/actions/messageAction'
// import { setRouterLocationAction } from '../../flux/actions/authActions'

import './home.scss'
import config from '../../utils/config.js'
import { transSearchKeyword } from '../../utils/tools'
import AppHeader from '../../components/Header'
import Slide from './subpage/Slide'
import SmaillType from './subpage/SmaillType'
import ProductBox from './subpage/ProductBox'
import Footer from '../../components//Footer/'

class Home extends Component {
	constructor(props) {
		super();
		this.state = {
			// 大分类信息
			bigType:[],
			selectedBigid: -1, // -1 不展示，其他为 bigType的 id
      bigTypeIndex: -1,
      searchKey: '',
      recommendProducts: [
        {bigId: 3, type: '女鞋 男鞋 箱包', bgImg: 'nvxie.jpg', color: 'rgb(255,95,95)'},
        {bigId: 6, type: '手机 数码 电脑办公', bgImg: 'shouji_shuma_recommend.jpg', color: '#fff'},
        {bigId: 2, type: '男装 运动户外', bgImg: 'yundong.jpg', color: 'rgb(199,56,56)'},
        {bigId: 10, type: '大家电 生活电器', bgImg: 'dajiadian.jpg', color: '#fff'},
      ],
      navTop: [
        {tit: '游戏本', detailId: 390},
        {tit: '休闲裤', detailId: 1167},
        {tit: '短袖衬衫', detailId: 1157},
        {tit: '夹克', detailId: 1140},
        {tit: '耳机', detailId: 423},
        {tit: 'VR眼镜', detailId: 396},
        {tit: '双肩背包', detailId: 113},
        {tit: '健身服', detailId: 110},
      ],
		}
		this.onBigTypeSelect = this.onBigTypeSelect.bind(this);
		this.CurrentSmaillType = this.CurrentSmaillType.bind(this);
	}
	componentWillMount() {
    // this.props.setRouterLocationAction('/')
    if (typeof(window) === 'object') {  // 从本地储存取出
      var bigType = localStorage.getItem('productType')
      if (bigType) {
        try {
          bigType = JSON.parse(bigType)
          return this.setState({
            bigType
          })
        }catch(err) {
          console.error('bigType', err)
        }
      }
    }
		// 获取大分类表中数据
		axios.get(config.HOST + '/api/goods/type?type=big&limit=16')
			.then(res => {
				if (!res.data.success) {
					return console.error('商品分类列表获取失败');
				}
				this.setState({
					bigType: res.data.payload
				}, () => {
          if (typeof(window) === 'object') {
            localStorage.setItem('productType', JSON.stringify(res.data.payload))
          }
        });
			})
			.catch(err => {
        if (typeof(window) === 'object')
				  console.error(err);
			});
	}

	// 设置或获取 state的bigType 的 smaillType
	CurrentSmaillType(bigid, smaillType, getSmaill = false) {
		var bigType = this.state.bigType
		if (bigType.length === 0) return;
		for (var i = 0,len = bigType.length; i < len; i++) {
			if (bigType[i]._id === bigid) {
				// 获取smaillType
				if (getSmaill) {
					return bigType[i].smaillType
				}
        // 存储到本地储存中
        if (typeof(window) === 'object' && !bigType[i].smaillType) {
          bigType[i].smaillType = smaillType
          localStorage.setItem('productType', JSON.stringify(this.state.bigType))
        }else {
          bigType[i].smaillType = smaillType
        }
				// 设置 smaillType
				this.setState({
					bigType: bigType
				});
			}
		}
	}
  // 获取小分类表
	onBigTypeSelect(e) {
		// showsmaill => true
    var target = e.currentTarget
		var bigid = Number(target.getAttribute('bigid'));
    var index = target.getAttribute('index')
		this.setState({
			selectedBigid: bigid,
      bigTypeIndex: index
		}, () => {
      var bigType = this.state.bigType.find(i => i._id === bigid)
      if (Array.isArray(bigType.smaillType)) return; // 小分类已存在

      axios.get(config.HOST + '/api/goods/type?type=smaill&bigid=' + bigid)
        .then(res => {
          if (!res.data.success) return;
          this.CurrentSmaillType(bigid, res.data.payload);
        })
        .catch(err => {
          console.error(err);
        })
    })
	}

	onBigTypeLeave(){
		this.setState({selectedBigid: -1});
	}
  searchInputChange(e) {
    this.setState({
      searchKey: e.target.value
    })
  }
  searchProduct(e) {
    e.preventDefault();
    var keyword = transSearchKeyword(this.state.searchKey)
    if (!keyword) {
      return this.props.alertMessageAction('请输入搜索的内容')
    }
    this.props.setSearchKeyAction(this.state.searchKey)
    this.props.history.push(`/search_product?q=${keyword}&limit1=0&limit2=50`)
  }
	render() {
		return (
			<div className="home-body">
				<AppHeader />
				<div className="headerCon">
					<form onSubmit={this.searchProduct.bind(this)}>
						<input
							type="text"
							className="search-text"
              value={this.state.searchKey}
              onChange={this.searchInputChange.bind(this)}
							placeholder="搜索 优选 商品/品牌/店铺"
						/>
						<button type="submit" className="search-btn">搜索</button>
					</form>
					<ul className="hot-query">
					{/*搜索框下面展示*/}
					{
						this.state.navTop.map((item, index) => (
              <li key={index}>
                <Link to={`/search_product?detailId=${item.detailId}`}>{item.tit}</Link>
              </li>
            ))
					}
					</ul>
				</div>
				<div className="main-nav">
					<ul className="nav-t-wrap">
						{
							this.state.navTop.map((item, i) => (<li key={i}><Link to={`/search_product?detailId=${item.detailId}`}>{item.tit}</Link></li>))
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
								this.state.bigType.map((item, index) => (
									<div
										key={item._id}
										className={cnames(`nav-l-item`, {
											'nav-l-item-sel': this.state.selectedBigid===item._id,
                      [`color${index}`]: this.state.selectedBigid===item._id,
										})}
										bigid={item._id}
                    index={index}
										onMouseOver={this.onBigTypeSelect}
									>{item.bigName}</div>
								))
							}
							</div>
							{
								this.state.selectedBigid === -1 ? null :
								<SmaillType bigTypeIndex={this.state.bigTypeIndex} smaillType={this.CurrentSmaillType(this.state.selectedBigid,null,true)} />
							}
						</div>
					</div>
					{/*轮播图组件，传递slideImg图片组*/}
					<Slide />
				</div>
        <div className="product-box">
          <div className="product_recomment_wrap">
            {
              // 懒加载推荐商品组件
              this.state.recommendProducts.map((item, index) => (
                <Lazyload key={index} height={600} offset={100}>
                  <ProductBox
                    color={item.color}
                    productBigTypeId={item.bigId}
                    productBigType={item.type}
                    productBackImage={item.bgImg} />
                </Lazyload>)
              )
            }
          </div>
        </div>
        <Footer />
			</div>
		)
	}
}
//setRouterLocationAction
export default connect(null, { setSearchKeyAction, alertMessageAction })(Home);
