import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import GameData from '../utils/gameData';
import Modal, { LoginContent } from './ModalComp.js';

function Navbar(props) {
    const { loggedIn, setLoggedIn, seasons, gameData, getGame } = props;

    Navbar.propTypes = {
        loggedIn: PropTypes.string,
        setLoggedIn: PropTypes.func.isRequired,
        seasons: PropTypes.object.isRequired,
        gameData: PropTypes.instanceOf(GameData).isRequired,
        getGame: PropTypes.func.isRequired,
    };

    const [isNavbarVisible, setNavbarVisible] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrollDistance, setScrollDistance] = useState(0);
    const [menuOptions, setOptions] = useState(gameData.menuValues);

    useEffect(() => {
        setOptions(gameData.menuValues);
    }, [gameData]);

    useEffect(() => {
        // enable hide on scroll
        let previousScrollPos = window.scrollY;

        const handleScroll = () => {
            const currentScrollPos = window.scrollY;
            const shouldShowNavbar
                = (previousScrollPos > currentScrollPos || currentScrollPos < 20)
                && currentScrollPos < window.innerHeight;

            if (menuOpen) {
                const newDist = scrollDistance + previousScrollPos - currentScrollPos;
                if (
                    Math.abs(newDist)
                    > (document.body.scrollHeight - window.innerHeight) / 2
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
            previousScrollPos = currentScrollPos;
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [menuOpen]);

    const navigate = useNavigate();

    useEffect(() => {
        setMenuOpen(false);
    }, [useLocation()]);

    const logInOut = () => {
        if (loggedIn) {
            setLoggedIn('');
            navigate('/');
            return;
        }

        setModalOpen(true);
    };

    return (
        <div>
            <nav className={`navbar ${isNavbarVisible ? 'visible' : 'hidden'}`}>
                <div className='nav-content'>
                    <Link className='clean-link nav-title' to='/'>
                        <div>Fantasy Survivor</div>
                    </Link>
                    <Menu
                        loggedIn={loggedIn}
                        logInOut={logInOut}
                        isOpen={menuOpen}
                        setIsOpen={setMenuOpen}
                        options={menuOptions}
                        seasons={seasons}
                        getGame={getGame}
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
    const { loggedIn, logInOut, isOpen, setIsOpen, options, seasons, getGame } = props;

    Menu.propTypes = {
        loggedIn: PropTypes.string,
        logInOut: PropTypes.func.isRequired,
        isOpen: PropTypes.bool.isRequired,
        setIsOpen: PropTypes.func.isRequired,
        options: PropTypes.object.isRequired,
        seasons: PropTypes.object.isRequired,
        getGame: PropTypes.func.isRequired,
    };

    const [selectedSeason, setSelectedSeason] = useState({});
    const [survivorDirect, setSurvivorDirect] = useState('');
    const [playerDirect, setPlayerDirect] = useState('');
    const [editable, setEditable] = useState(false);

    useEffect(() => {
        setSelectedSeason(seasons.defaultSeason);
    }, [seasons]);

    useEffect(() => {
        if (!selectedSeason?.value) {
            return;
        }
        getGame(selectedSeason.value);
    }, [selectedSeason]);


    const handleEditToggle = () => {
        setEditable(!editable);
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const navigate = useNavigate();

    const goTo = URL => {
        setSurvivorDirect('');
        setPlayerDirect('');
        toggleMenu();
        navigate(URL);
    };

    return (
        <div className={`menu ${isOpen ? 'open' : ''}`}>
            <div className='icon' onClick={toggleMenu}>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
            </div>
            <ul className='menu-list'>
                <li>
                    {loggedIn && (
                        <Link
                            className='clean-link survivor-button'
                            to={`/Player/${loggedIn}`}
                        >
                            {loggedIn}
                        </Link>
                    )}
                    <button className={`survivor-button ${!loggedIn && 'span-2'}`}
                        onClick={() => logInOut()}>
                        {loggedIn ? 'Log Out' : 'Log In'}
                    </button>
                </li>
                <li>
                    <Select
                        id='season-select'
                        className='span-2'
                        placeholder='Seasons'
                        options={seasons.seasons}
                        onChange={value => {
                            setSelectedSeason(value);
                            goTo("/");
                        }}
                        value={selectedSeason}
                        defaultValue={seasons.defaultSeason}
                    />
                </li>
                <li>
                    <Select
                        placeholder='Survivors'
                        options={options.Survivors}
                        value={survivorDirect}
                        onChange={value => goTo(`/Survivor/${value.value}`)}
                        onBlur={handleEditToggle}
                        autoFocus
                    />
                    <Select
                        placeholder='Players'
                        options={options.Players}
                        value={playerDirect}
                        onChange={value => goTo(`/Player/${value.value}`)}
                    />
                </li>
            </ul>
        </div>
    );
}

export default Navbar;
