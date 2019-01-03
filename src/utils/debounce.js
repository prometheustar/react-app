function debounce() {
	var timer = null;
	return function (handler) {
		window.clearTimeout(timer);
		timer = window.setTimeout(function () {
			handler && handler();
		}, 1000);
	}
}
export default debounce();