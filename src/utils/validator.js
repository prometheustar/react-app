export const isEmpty = value => {
	return value === undefined || value === null ||
		(typeof value === 'object' && Object.keys(value).length === 0) ||
		(typeof value === 'string' && value.length === 0)
}

export const isPhone = number => {
	return /^1[0-9]{10}$/.test(number);
}

export const isLength = (value, opts) => {
	if (typeof value !== 'string') return false;
	return (value.length >= opts.min && value.length <= opts.max)
}

export const isEmail = email => {
  return /^[A-z\d]+([-_.][A-z\d]+)*@([A-z\d]+[-.])+[A-z\d]{2,4}$/.test(email)
}
