import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import Game from "../fantasy/game";
import { smallScreen } from "../smallScreen";

console.log(smallScreen);

import Modal, { LoginContent } from "../components/ModalComp";

function Navbar(props) {
  var { loggedIn, setLoggedIn } = props;
  var [isNavbarVisible, setNavbarVisible] = useState(true);
  var [modalOpen, setModalOpen] = useState(false);
  var [menuOpen, setMenuOpen] = useState(false);

  var [menuOptions, setMenuOptions] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    let prevScrollPos = window.scrollY;

    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const shouldShowNavbar =
        prevScrollPos > currentScrollPos || currentScrollPos === 0;

      setNavbarVisible(shouldShowNavbar);
      prevScrollPos = currentScrollPos;

      setMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);

    Game.getMenuValues().then((options) => {
      setMenuOptions(options);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [useLocation()]);

  useEffect(() => {
    setModalOpen(!loggedIn);
  }, [loggedIn]);

  const logInOut = () => {
    if (loggedIn) {
      setLoggedIn("");
      navigate("/");
      return;
    }
    setModalOpen(true);
  };

  var navButtonStyle = { "--noHoverColor": "var(--defaultButton)" };

  return (
    <div>
      <nav className={`navbar ${isNavbarVisible ? "visible" : "hidden"}`}>
        <div className="nav-content">
          <div className="survivor-header navbar-left">Fantasy Survivor</div>
          {loggedIn && (
            <Link
              className="clean-link survivor-button"
              style={navButtonStyle}
              to={`/Player/${loggedIn}`}
            >
              {loggedIn}
            </Link>
          )}
          <Link
            className="clean-link survivor-button"
            style={navButtonStyle}
            to="/"
          >
            Home
          </Link>
          <button
            className="survivor-button"
            style={navButtonStyle}
            onClick={() => logInOut()}
          >
            {loggedIn ? "Log Out" : "Log In"}
          </button>
          <Menu
            isOpen={menuOpen}
            setIsOpen={setMenuOpen}
            options={menuOptions}
          />
        </div>
      </nav>
      <Modal
        isOpen={modalOpen}
        closeModal={() => setModalOpen(false)}
        content={
          <LoginContent setLoggedIn={setLoggedIn} setModalOpen={setModalOpen} />
        }
      />
    </div>
  );
}

function Menu(props) {
  var { isOpen, setIsOpen, options } = props;
  var [survivorDirect, setSurvivorDirect] = useState("");
  var [playerDirect, setPlayerDirect] = useState("");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navigate = useNavigate();

  const goTo = (URL) => {
    setSurvivorDirect("");
    setPlayerDirect("");
    toggleMenu();
    navigate(URL);
  };

  return (
    <div className={`menu ${isOpen ? "open" : ""}`}>
      <div className="icon" onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      <ul className="menu-list">
        <div className="inline-div">
          <Select
            placeholder="Survivors"
            options={options.Survivors}
            value={survivorDirect}
            onChange={(value) => goTo(`/Survivor/${value.value}`)}
          />
          <Select
            placeholder="Players"
            options={options.Players}
            value={playerDirect}
            onChange={(value) => goTo(`/Player/${value.value}`)}
          />
        </div>
      </ul>
    </div>
  );
}

export default Navbar;
