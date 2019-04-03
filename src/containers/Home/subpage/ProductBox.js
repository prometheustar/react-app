import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Link } from 'react-router-dom'

import config from '../../../utils/config'
import { transPrice } from '../../../utils/tools'

const HOST = config.HOST

function splitProductName(name) {
  if (typeof(name) !== 'string') return ''
  return name.length < 20 ? name : name.substring(0, 19) + '...'
}

class ProductBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      products: [],
      loading: true,
      success: true
    }
  }

  componentWillMount() {
    if (!/^[1-9]\d*$/.test(this.props.productBigTypeId)) return;
    axios.get(`${HOST}/api/goods/search_product?limit1=0&limit2=9&bigId=${this.props.productBigTypeId}`)
      .then(({data}) => {
        console.log('懒加载', data)
        if (!data.success) {
          return this.setState({
            loading: false,
            success: false,
          })
        }
        this.setState({
          success: true,
          loading: false,
          products: data.payload.products
        })
      })
      .catch(err => {
        this.setState({
          loading: false,
          success: false,
        })
      })
  }

  render() {
    return <div className="rec-item" style={{background: `url(${HOST}/image/ui/${this.props.productBackImage}) left top no-repeat`}}>
      <h3 className="rec-item-tit" style={{
        color: this.props.color
      }}>{ this.props.productBigType }</h3>
      {
        this.state.loading ? <div>加载中</div> :
        !this.state.success ? <div>加载失败</div> :
        this.state.products.length === 0 ? <div>商品为空</div> : (
          this.state.products.map((product, index) => (
            <div className="rec-i-item" key={index}>
              <div className="rec-i-item-wrap">
                <div className="rec-i-logo"><Link to={`/product_detail?goodId=${product._id}`}><img src={`${HOST}/image/goods/logo/${product.logo}_210x210q90.jpg`}/></Link></div>
                <div className="rec-i-name"><Link to={`/product_detail?goodId=${product._id}`}>
                  <p title={product.goodName}>{splitProductName(product.goodName)}</p>
                </Link></div>
                <div className="rec-i-number">购买次数: <span className="rec-i-number-font">{product.number}</span></div>
                <div className="rec-i-price">￥{transPrice(product.nowPrice)}</div>
              </div>
            </div>
          ))
        )
      }
    </div>
  }
}

ProductBox.propTypes = {
  productBigTypeId: PropTypes.number.isRequired,
  productBigType: PropTypes.string.isRequired,
  productBackImage: PropTypes.string.isRequired
}

export default ProductBox
