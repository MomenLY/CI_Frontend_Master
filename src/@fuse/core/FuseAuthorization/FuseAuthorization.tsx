import { Component, ReactNode } from "react";
import { matchRoutes } from "react-router-dom";
import FuseUtils from "@fuse/utils";
import AppContext, { AppContextType } from "app/AppContext";
import withRouter from "@fuse/core/withRouter";
import history from "@history";
import { WithRouterProps } from "@fuse/core/withRouter/withRouter";
import { FuseRouteItemType } from "@fuse/utils/FuseUtils";
import {
  getSessionRedirectUrl,
  resetSessionRedirectUrl,
  setSessionRedirectUrl,
} from "@fuse/core/FuseAuthorization/sessionRedirectUrl";
import FuseLoading from "@fuse/core/FuseLoading";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";

type FuseAuthorizationProps = {
  children: ReactNode;
  location: Location;
  userRole: string[] | string;
  loginRedirectUrl?: string;
  enforcePasswordReset?: boolean;
} & WithRouterProps;

type State = AppContextType & {
  accessGranted: boolean;
};

function isUserGuest(role: string[] | string) {
  return !role || (Array.isArray(role) && role.length === 0);
}

/**
 * FuseAuthorization is a higher-order component that wraps its child component which handles the authorization logic of the app.
 * It checks the provided Auth property from FuseRouteItemType (auth property) against the current logged-in user role.
 */
class FuseAuthorization extends Component<FuseAuthorizationProps, State> {
  constructor(props: FuseAuthorizationProps, context: AppContextType) {
    super(props);

    const { routes } = context;

    this.state = {
      accessGranted: true,
      routes,
    };
  }

  componentDidMount() {

    const { accessGranted } = this.state;
    const { enforcePasswordReset } = this.props;

    if (!accessGranted || enforcePasswordReset === true) {
      this.redirectRoute();
    }
  }

  shouldComponentUpdate(nextProps: FuseAuthorizationProps, nextState: State) {
    const { accessGranted } = this.state;
    return nextState.accessGranted !== accessGranted;
  }

  componentDidUpdate() {
    const { accessGranted } = this.state;
    const { enforcePasswordReset } = this.props;

    if (!accessGranted || enforcePasswordReset) {
      this.redirectRoute();
    }
  }

  static getDerivedStateFromProps(props: FuseAuthorizationProps, state: State) {

    const { location, userRole } = props;
    const { pathname } = location;
    const matchedRoutes = matchRoutes(state.routes, pathname);

    const matched = matchedRoutes ? matchedRoutes[0] : false;

    const isGuest = isUserGuest(userRole);

    if (!matched) {
      return { accessGranted: true };
    }

    const { route }: { route: FuseRouteItemType } = matched;

    const userHasPermission = FuseUtils.hasPermission(route.auth, userRole);
    const ignoredPaths = [
      "/callback",
      "/sign-in",
      "/sign-out",
      "/logout",
      "/404",
      "/sign-in-success",
    ];
    if (matched && !userHasPermission && !ignoredPaths.includes(pathname)) {
      setSessionRedirectUrl(window.location.href);
    }

    if (matched && userHasPermission && !ignoredPaths.includes(pathname)) {
      const isRoleDefined = localStorage.getItem(cacheIndex.userRoleId);
      if (isRoleDefined === null && isGuest === false) {
        let _redirectUrl = getSessionRedirectUrl();
        if (_redirectUrl === null) {
          setSessionRedirectUrl(pathname);
        }
        window.location.href = "/sign-in-success";
      }
    }

    /**
     * If user is member but don't have permission to view the route
     * redirected to main route '/'
     */
    if (!userHasPermission && !isGuest && !ignoredPaths.includes(pathname)) {
      setSessionRedirectUrl("/");
    }

    return {
      accessGranted: matched ? userHasPermission : true,
    };
  }


  redirectRoute() {
    const {
      userRole,
      loginRedirectUrl = "/",
      enforcePasswordReset,
    } = this.props;

    const redirectUrl = loginRedirectUrl;
    if (!userRole || userRole.length === 0) {
      setTimeout(() => history.push("/sign-in-success"), 0);
    } else {
      /*
        User is member
        User must be on unAuthorized page or just logged in
        Redirect to dashboard or loginRedirectUrl
      */
      const sessionRedirectUrl = getSessionRedirectUrl();
      setTimeout(() => history.push(redirectUrl), 0);
      if (sessionRedirectUrl !== null && !sessionRedirectUrl.includes('admin/expo/attendee') && !sessionRedirectUrl.includes('/events/')) {
        resetSessionRedirectUrl();
      }
    }
  }

  render() {
    const { accessGranted } = this.state;
    const { children } = this.props;

    return accessGranted ? children : <FuseLoading />;
  }
}

FuseAuthorization.contextType = AppContext;

export default withRouter(FuseAuthorization);