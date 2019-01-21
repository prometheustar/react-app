import React from 'react'

function SmaillType(props) {
	var smaillType = props.smaillType || [];
	return (
		<div className="smaillType">
		<h1>Detail</h1>
		{
			smaillType.map(item => {
				return (
					<div key={item._id} className="smaill-item">
						<div className="smaill-item-title">{item.smaillName}</div>
						<div className="smaill-detail">
						{
							item.detail.map(detail => {
								return (
									<span key={detail._id}>{detail.detailName}</span>
								)
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