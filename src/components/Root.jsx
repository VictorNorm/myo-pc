import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import Header from "./Header";

export default function Root() {

    const location = useLocation();
    const hideNavPaths = ['/login', "/signup"];

    return (
        <>
        {!hideNavPaths.includes(location.pathname) && <Header/>}
        {!hideNavPaths.includes(location.pathname) && <Nav />}
        <div className="App">
          <Outlet />
        </div>
      </>
    );
  }
