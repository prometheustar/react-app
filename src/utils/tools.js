// 将两个数转换成整数相乘
export const intMultiplication = function (a, b) {
  a = a + ''
  b = b + ''
  var deci = 0  // 2个操作数的小数位数
  // 判断是否小数
  if (/^\d+\.\d+$/.test(a)) {
    deci += a.replace(/^\d+\.(?=\d+$)/, '').length
    a = a.replace('.', '')
  }
  if (/^\d+\.\d+$/.test(b)) {
    deci += b.replace(/^\d+\.(?=\d+$)/, '').length
    b = b.replace('.', '')
  }
  var result = (Number(a) * Number(b)) + ''
  return deci > 0 ? result.substring(0, result.length - deci) + '.' + result.substring(result.length - deci) : result
}

// 将两个数转换成整数相加
export const intAdd = function (a, b) {
  a = a + ''
  b = b + ''
  var deci1 = 0;
  var deci2 = 0;
  if (/^\d+\.\d+$/.test(a)) {
    deci1 = a.replace(/^\d+\.(?=\d+$)/, '').length
    a = a.replace('.', '')
  }
  if (/^\d+\.\d+$/.test(b)) {
    deci2 += b.replace(/^\d+\.(?=\d+$)/, '').length
    b = b.replace('.', '')
  }
  if (deci1 !== deci2) {
    for (var i = 0, len = Math.abs(deci1 - deci2); i < len; i++) {
      if (deci1 < deci2) {
        a += '0'
      }else {
        b += '0'
      }
    }
  }
  var result = Number(a) + Number(b) + ''
  var maxDeci = Math.max(deci1, deci2)
  return maxDeci !== 0 ? result.substring(0, result.length - maxDeci) + '.' + result.substring(result.length - maxDeci) : result
}

export const transPrice = function (price) {
  return /^\d+$/.test(price) ? price + '.00' :  // 没有小数
  /^\d+\.\d$/.test(price) ? price + '0' : price  // 一位小数
}

export const formatDate = function(date, year) {
  const d = new Date(date)
  if (Number.isNaN(d.getDay())) {
    return ''
  }
  var format = year ? d.getFullYear() + '-' : ''

  return (format + (d.getMonth() + 1) + '-' +
    d.getDate() + ' ' +
    d.getHours() + ':' +
    d.getMinutes() + ':' +
    d.getSeconds())
}

export const getDate = function(year, month) {
  if (!/^(19|20)\d{2}$/.test(year) || !/^([1-9]|1[012])$/.test(month)) return null
  var date = new Date(year, month, 0).getDate()
  var days = []
  for (var i = 1; i <= date; i++) {
    days.push(i)
  }
  return days;
}

export const transSearchKeyword = (q) => {
  if (typeof(q) !== 'string') return null
  q = q.trim()
  if (q === '') return null
  return encodeURIComponent(q.replace(/([ ,.|]+)/g, '+'))
}

export const transURL = (url, reverse) => {
  if (typeof url !== 'string' || url === '')
    return ''
  if (reverse)
    return url.replace(/OxO/g, '/').replace(/OdO/g, '=').replace(/OwO/g, '?').replace(/OaO/g, '&')
  return url.replace(/\//g, 'OxO').replace(/\=/g, 'OdO').replace(/\?/g, 'OwO').replace(/&/g, 'OaO')
}

export const cutString = (str, len) => {
  if (typeof str !== 'string') return '';
  len = len || 10
  return str.length > len ? str.substring(0, len) + '...' : str
}
