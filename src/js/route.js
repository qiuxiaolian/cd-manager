// CopyRight 2018 caicloud authors. All rights reserved

import { Router, Route, browserHistory } from "react-router";
import List from "./components/list/index";
import Detail from "./components/detail/index";
import AddForm from "./components/add/index";

const MAIN_ROUTE = `/plugin/${process.env.X_MODULE}`;

const RouteContainer = () => (
  <Router history={browserHistory}>
    <Route path={MAIN_ROUTE} name="Delopyment" component={List} />
    <Route path={`${MAIN_ROUTE}/deployments/:deployment`} component={Detail} />
    <Route path={`${MAIN_ROUTE}/add`} component={AddForm} />
    <Route
      path={`${MAIN_ROUTE}/deployments/:deployment/update`}
      component={AddForm}
    />
  </Router>
);

export default RouteContainer;
