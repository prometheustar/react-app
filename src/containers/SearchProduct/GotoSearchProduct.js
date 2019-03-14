import React from 'react'
import { historyPush } from './index'

class GotoSearchProduct extends React.Component {
  componentWillMount() {
    this.props.history.push('/search_products' + this.props.location.search)
  }
  render() {
    return (
      <div>404</div>
    )
  }
}
export default GotoSearchProduct
