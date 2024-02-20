import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import GameData from '../utils/gameData';
import Modal, { LoginContent } from './ModalComp.js';
import WindowContext from './WindowContext.js';
import { fetchSeasons } from '../utils/miscUtils.js';

function Navbar(props) {
    const { loggedIn, setLoggedIn, setSeason, gameData } = props;

    Navbar.propTypes = {
        loggedIn: PropTypes.string,
        setLoggedIn: PropTypes.func.isRequired,
        setSeason: PropTypes.func.isRequired,
        gameData: PropTypes.instanceOf(GameData).isRequired,
    };

    const [isNavbarVisible, setNavbarVisible] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrollDistance, setScrollDistance] = useState(0);

    const [menuOptions, setOptions] = useState(gameData.menuValues);
    const [seasons, setSeasons] = useState({ seasons: [], defaultSeason: '' });

    useEffect(() => {
        setOptions(gameData.menuValues);
    }, [gameData]);

    useEffect(() => {
        if (loggedIn) {
            setSeason(fetchSeasons(loggedIn, setSeasons).defaultSeason);
            
        }
        else setSeasons({ seasons: [], defaultSeason: '' });
    }, [loggedIn]);

    const navigate = useNavigate();

    useEffect(() => {
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
                        setSeason={setSeason}
                        options={menuOptions}
                        seasons={seasons}
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
    const { loggedIn, logInOut, isOpen, setIsOpen, setSeason, options, seasons } = props;

    Menu.propTypes = {
        loggedIn: PropTypes.string,
        logInOut: PropTypes.func.isRequired,
        isOpen: PropTypes.bool.isRequired,
        setIsOpen: PropTypes.func.isRequired,
        setSeason: PropTypes.func.isRequired,
        options: PropTypes.object.isRequired,
        seasons: PropTypes.object.isRequired,
    };

    const { tinyScreen } = useContext(WindowContext);

    const [selectedSeason, setSelectedSeason] = useState({});
    const [survivorDirect, setSurvivorDirect] = useState('');
    const [playerDirect, setPlayerDirect] = useState('');
    const [editable, setEditable] = useState(false);

    useEffect(() => {
        setSelectedSeason(seasons.defaultSeason);
    }, [seasons]);

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
                    {loggedIn && !tinyScreen && (
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
                            setSeason(value.value);
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
