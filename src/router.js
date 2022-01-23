import React from "react";
import { Router, Route, Switch, Redirect } from "dva/router";
import dynamic from "dva/dynamic";
import CommomLayout from "@/components/Layout/index";

function RouterConfig({ history, app }) {
  const Recommend = dynamic({
    app,
    models: () => [import("./models/score")],
    component: () => import("./routes/Recommend"),
  });
  const Reward = dynamic({
    app,
    models: () => [import("./models/score")],
    component: () => import("./routes/Reward"),
  });
  const PointsPackage = dynamic({
    app,
    models: () => [import("./models/score")],
    component: () => import("./routes/PointsPackage"),
  });
  const PointsPackageStart = dynamic({
    app,
    models: () => [import("./models/score")],
    component: () => import("./routes/PointsPackage/start"),
  });
  const PointsPackageEnd = dynamic({
    app,
    models: () => [import("./models/score")],
    component: () => import("./routes/PointsPackage/end"),
  });
  const PointsPackageSuccess = dynamic({
    app,
    models: () => [import("./models/score")],
    component: () => import("./routes/PointsPackage/success"),
  });

  const pointsPackageNotFound = dynamic({
    app,
    models: () => [import("./models/score")],
    component: () => import("./routes/PointsPackage/404"),
  });

  const Activity = dynamic({
    app,
    models: () => [import("./models/score")],
    component: () => import("./routes/Activity"),
  });
  const EarnPoint = dynamic({
    app,
    models: () => [import("./models/score")],
    component: () => import("./routes/EarnPoints"),
  });
  const Introduce = dynamic({
    app,
    models: () => [import("./models/score")],
    component: () => import("./routes/Introduce"),
  });
  const Egg = dynamic({
    app,
    models: () => [import("./models/score")],
    component: () => import("./routes/Egg"),
  });
  const Promotion = dynamic({
    app,
    models: () => [import("./models/promotion")],
    component: () => import("./routes/Promotion"),
  });
  const PromotionPad = dynamic({
    app,
    models: () => [import("./models/promotion")],
    component: () => import("./routes/Promotion/pad"),
  });
  const routerMap = {
    "#/recommend": "/recommend",
    "#/reward": "/reward",
    "#/activity": "/activity",
    "#/earn-point": "/earn-point",
    "#/introduce": "/introduce",
    "#/egg": "/egg",
    "#/pointsPackageNotFound": "/pointsPackageNotFound",
  };
  const routerMapParam = [
    "pointsPackage",
    "pointsPackageStart",
    "pointsPackageEnd",
    "pointsPackageSuccess",
    "promotion",
  ];
  if (history.location.pathname === "/") {
    if (routerMap[history.location.hash]) {
      history.replace(routerMap[history.location.hash]);
    }
    routerMapParam.forEach((item) => {
      if (history.location.hash.indexOf(item) !== -1) {
        const hashArr = history.location.hash.split("/");
        if (hashArr[1] === item && hashArr.length === 3) {
          history.replace(`${item}/${hashArr[2]}`);
        }
        if (hashArr[1] === item && hashArr.length === 4) {
          history.replace(`${item}/${hashArr[2]}/${hashArr[3]}`);
        }
      }
    });
  }
  return (
    <Router history={history}>
      <React.Fragment>
        <Switch>
          <Route path="/introduce" component={Introduce} exact />
          <Route path="/egg" component={Egg} exact />
          {/* 活動未開始或者結束 */}
          <Route path="/promotion/pad/:id" component={PromotionPad} exact />
          {/* 推廣活動路由開始 */}
          <Route path="/promotion/:id" component={Promotion} exact />
          <Route path="/pointsPackage/:id" component={PointsPackage} exact />
          <Route
            path="/pointsPackageStart/:id"
            component={PointsPackageStart}
            exact
          />
          <Route
            path="/pointsPackageEnd/:id"
            component={PointsPackageEnd}
            exact
          />
          <Route
            path="/pointsPackageNotFound"
            component={pointsPackageNotFound}
            exact
          />
          <Route
            path="/pointsPackageSuccess/:id"
            component={PointsPackageSuccess}
            exact
          />
          {/* 推廣活動路由結束 */}
          <CommomLayout>
            <Switch>
              <Route path="/recommend" component={Recommend} exact />
              <Route path="/reward" component={Reward} exact />
              <Route path="/activity" component={Activity} exact />
              <Route path="/earn-point" component={EarnPoint} exact />
              <Redirect to={{ pathname: "/recommend" }} />
            </Switch>
          </CommomLayout>
        </Switch>
      </React.Fragment>
    </Router>
  );
}

export default RouterConfig;
