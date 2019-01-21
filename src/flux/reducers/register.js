let initialState = {
	step: 0,
	phone: '13888888888'
}
export default (state = initialState, action) => {
	switch(action.type) {
		case "STEP_CHANGE":
			return {
				...state,
				step: action.step
			}
		case "GET_PHONE":
			return {
				...state,
				phone: action.phone
			}
		case "NEW_USER":
			return action.user;
		default:
			return state;
	}
}