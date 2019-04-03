import React from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'

function SmaillType(props) {
	var smaillType = props.smaillType || [];
	return (
		<div className="smaillType">
		{
			smaillType.map(item => {
				return (
					<div key={item._id} className="smaill-item">
						<div className="smaill-item-title">{item.smaillName}</div>
						<div className="smaill-detail">
						{
							item.detail.map(detail => {
								return (<div className="sd-item" key={detail._id}>
                  <Link className={classnames({
                    [`color${props.bigTypeIndex}`]: Math.random() > 0.75
                  })} to={`/search_products?detailId=${detail._id}`}>{detail.detailName}</Link>
                </div>)
							})
						}
						</div>
					</div>
				)
			})
		}
		</div>
	)
}

export default SmaillType;
