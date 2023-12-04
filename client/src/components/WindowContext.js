import React, { useEffect, useState, createContext, useCallback } from "react";
import PropTypes from "prop-types";

const WindowContext = createContext({
  tinyScreen: false,
  smallScreen: false,
  mediumScreen: false,
  largeScreen: false,
});

function WindowContextProvider(props) {
  var { children } = props;

  WindowContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  const getWidth = useCallback(() => {
    return window.innerWidth;
  }, []);

  const [windowSize, setWindowSize] = useState({
    largeScreen: window.innerWidth < 1260,
    mediumScreen: window.innerWidth < 975,
    smallScreen: window.innerWidth < 775,
    tinyScreen: window.innerWidth < 535,
    width: getWidth(),
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        largeScreen: getWidth() < 1260,
        mediumScreen: getWidth() < 975,
        smallScreen: getWidth() < 775,
        tinyScreen: getWidth() < 535,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [getWidth]);

  return (
    <WindowContext.Provider value={windowSize}>
      {children}
    </WindowContext.Provider>
  );
}

export default WindowContext;
export { WindowContextProvider };
