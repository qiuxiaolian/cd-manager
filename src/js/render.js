// Copyright 2018 caicloud authors. All rights reserved

import App from "./route";
import "../less/index.less";
import { Provider } from "react-redux";
import { createStore, combineReducers } from "redux";
import { reducer as formReducer } from "caicloud-redux-form";
// import reducer from "./reducer";

const rootReducer = combineReducers({
  form: formReducer
  // cdManager: reducer
});

let store = createStore(rootReducer);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector("body")
);
