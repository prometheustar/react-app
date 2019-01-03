
export const setLoginWay = way => dispatch => {
	dispatch({
		type: 'SET_LOGIN_WAY',
		payload: way
	});
}