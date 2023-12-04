import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import GameData from "../utils/gameData";

import Modal, { LoginContent } from "../components/ModalComp";
import WindowContext from "../components/WindowContext";

function Navbar(props) {
  var { loggedIn, setLoggedIn, gameData } = props;

  Navbar.propTypes = {
    loggedIn: PropTypes.string,
    setLoggedIn: PropTypes.func.isRequired,
    gameData: PropTypes.instanceOf(GameData).isRequired,
  };

  const { tinyScreen } = useContext(WindowContext);

  var [isNavbarVisible, setNavbarVisible] = useState(true);
  var [modalOpen, setModalOpen] = useState(false);
  var [menuOpen, setMenuOpen] = useState(false);
  var [scrollDistance, setScrollDistance] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let prevScrollPos = window.scrollY;

    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const shouldShowNavbar =
        (prevScrollPos > currentScrollPos || currentScrollPos < 20) &&
        currentScrollPos < window.innerHeight;

      if (menuOpen) {
        var newDist = scrollDistance + prevScrollPos - currentScrollPos;
        if (
          Math.abs(newDist) >
          (document.body.scrollHeight - window.innerHeight) / 2
        ) {
          setScrollDistance(0);
          setNavbarVisible(false);
          setMenuOpen(false);
        } else {
          setScrollDistance(newDist);
        }
        return;
      }
      setNavbarVisible(shouldShowNavbar);
      prevScrollPos = currentScrollPos;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [useLocation()]);

  const logInOut = () => {
    if (loggedIn) {
      setLoggedIn("");
      navigate("/");
      return;
    }
    setModalOpen(true);
  };

  return (
    <div>
      <nav className={`navbar ${isNavbarVisible ? "visible" : "hidden"}`}>
        <div className="nav-content">
          <div className="nav-title">Fantasy Survivor</div>
          {loggedIn && !tinyScreen && (
            <Link
              className="clean-link survivor-button"
              to={`/Player/${loggedIn}`}
            >
              {loggedIn}
            </Link>
          )}
          <Link className="clean-link survivor-button" to="/">
            Home
          </Link>
          <button className="survivor-button" onClick={() => logInOut()}>
            {loggedIn ? "Log Out" : "Log In"}
          </button>
          <Menu
            isOpen={menuOpen}
            setIsOpen={setMenuOpen}
            options={gameData.menuValues}
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

  Menu.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    options: PropTypes.object.isRequired,
  };

  var [survivorDirect, setSurvivorDirect] = useState("");
  var [playerDirect, setPlayerDirect] = useState("");

  var [editable, setEditable] = useState(false);

  const handleEditToggle = () => {
    setEditable(!editable);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);

    if (!isOpen) {
      var snapShot = document.evaluate(
        "//ul[@class='menu-list']//input",
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      for (var i = 0; i < snapShot.snapshotLength; i++) {
        console.log(snapShot.snapshotItem(i));
        if (editable) {
          snapShot.snapshotItem(i).setAttribute("readonly", true);
          snapShot.snapshotItem(i).removeAttribute("autofocus");
          snapShot.snapshotItem(i).removeAttribute("onclick");
        } else {
          snapShot.snapshotItem(i).removeAttribute("readonly");
          snapShot.snapshotItem(i).setAttribute("autofocus", "true");
          snapShot
            .snapshotItem(i)
            .setAttribute("onclick", "handleEditToggle()");
        }
      }
    }
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
            onBlur={handleEditToggle}
            autoFocus
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
