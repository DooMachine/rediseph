import * as uiActions from '../actions/ui';

export interface State {
    isLoading: boolean;
}

export const initialState: State = {
    isLoading: false,
};

export function reducer(state = initialState, action: uiActions.UIActions): State {
    switch (action.type) {
        case uiActions.UIActionTypes.TOGGLE_LOADING_BAR:
        {
            if (action.payload == null) {
                return {
                    ...state,
                    isLoading: !state.isLoading
                };
            }
            return {...state, isLoading: action.payload};
        }
        default:
            return state;
    }
}
