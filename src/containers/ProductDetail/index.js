import React from 'react'
import queryString from 'query-string'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { setProductDetailAction } from '../../flux/actions/productActions'
import { setRouterLocationAction } from '../../flux/actions/authActions'

import './index.scss'
import Header from '../../components/Header'
import StoreHeader from '../../components/StoreHeader'
import Spec from './subpage/Spec'
import ProductInfo from './subpage/ProductInfo'
import Footer from '../../components/Footer'

class ProductDetail extends React.Component {
  componentWillMount() {
    const info = queryString.parse(this.props.location.search)
    // 没有 goodId 返回上一级路由
    if (!/^\d+/.test(info.goodId)) {this.props.history.push(this.props.auth.location || '/')}
    this.props.setProductDetailAction(info.goodId)

    this.props.setRouterLocationAction('/product_detail' + this.props.location.search)
  }
  componentWillUnmount() {
    // 将 store 中的 productDetail，变成初始状态
    this.props.setProductDetailAction(-1)
  }
  render() {
    const product = this.props.productDetail
    if (!product || !product.goodDetail) {
      return <div>发生了意外的错误！</div>
    }
    return (
      <div>
        <Header />
        {
          product.goodDetail.length < 1 ?
            <div>{product.error || product.message || '商品还没有详情'}</div> :
            <div>
              {/*店铺头信息*/}
              <StoreHeader storeInfo={product.goodInfo} />
              <hr className="store-hr" />
              {/*商品信息属性*/}
              <Spec storeInfo={product.goodInfo} />
              {/*商品介绍信息*/}
              <ProductInfo comments={product.comments} infoPicture={product.infoPicture} />
            </div>
        }
        <Footer />
      </div>
    )
  }
}


ProductDetail.propTypes = {
  productDetail: PropTypes.object.isRequired,
  setProductDetailAction: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    productDetail: state.product.productDetail
  }
}
export default connect(mapStateToProps, { setProductDetailAction,setRouterLocationAction })(ProductDetail)
