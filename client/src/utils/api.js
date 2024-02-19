import axios from "axios";

var root =
    process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_API_ROOT
        : process.env.REACT_APP_API_ROOT_DEV;
const apiRoot = `${root}/api`;

class API {
    constructor() {
        this.requests = {};
    }

    //#region REQUEST DATA
    seasons() {
        this.requests.seasons = `${apiRoot}/seasons`;
        return this;
    }

    episodes(seasonName) {
        if (!seasonName) {
            console.error("No season tag provided");
            return this;
        }
        seasonName = encodeURIComponent(seasonName);
        this.requests.episodes = `${apiRoot}/${seasonName}/episodes`;
        return this;
    }

    survivors(seasonName, name) {
        if (!seasonName) {
            console.error("No season tag provided");
            return this;
        }
        seasonName = encodeURIComponent(seasonName);
        this.requests.survivors = `${apiRoot}/${seasonName}/survivor${name ? `/${name}` : "s"}`;
        return this.episodes().tribes();
    }

    players(seasonName, name) {
        if (!seasonName) {
            console.error("No season tag provided");
            return this;
        }
        seasonName = encodeURIComponent(seasonName);
        this.requests.players = `${apiRoot}/${seasonName}/player${name ? `/${name}` : "s"}`;
        return this.survivors();
    }

    tribes(seasonName) {
        if (!seasonName) {
            console.error("No season tag provided");
            return this;
        }
        seasonName = encodeURIComponent(seasonName);
        this.requests.tribes = `${apiRoot}/${seasonName}/tribes`;
        return this;
    }

    get(seasonName) {
        if (!seasonName) {
            console.error("No season tag provided");
            return this;
        }
        seasonName = encodeURIComponent(seasonName);
        return this.episodes(seasonName)
            .survivors(seasonName)
            .players(seasonName)
            .tribes(seasonName);
    }

   
    async newRequest() {
        var requests = Object.keys(this.requests);
        var responses = await Promise.all(
            requests.map((r) => axios.get(this.requests[r]))
        ).catch((err) => console.error(err));

        var data = {};
        for (var i = 0; i < requests.length; i++) {
            data[requests[i]] = responses[i].data;
        }
        return data;
    }
    //#endregion

    //#region WRITE DATA
    // add new episode
    static async addEpisode(seasonName, newEpisode) {
        if (!seasonName) {
            console.error("No season tag provided");
            return;
        }
        seasonName = encodeURIComponent(seasonName);
        return axios
            .post(`${apiRoot}/${seasonName}/episode/new`, newEpisode)
            .catch((err) => console.error(err));
    }

    // update episode
    static async updateEpisode(seasonName, updatedEpisode) {
        if (!seasonName) {
            console.error("No season tag provided");
            return;
        }
        seasonName = encodeURIComponent(seasonName);
        return axios
            .post(`${apiRoot}/${seasonName}/episode/update`, updatedEpisode)
            .catch((err) => console.error(err));
    }

    // submit draft picks
    static async submitDraft(seasonName, playerName, draftPicks) {
        if (!seasonName) {
            console.error("No season tag provided");
            return;
        }
        seasonName = encodeURIComponent(seasonName);
        return axios
            .post(`${apiRoot}/${seasonName}/player/draft`, { name: playerName, draft: draftPicks })
            .catch((err) => console.error(err));
    }

    // update player survivor pick
    static async updateSurvivorPick(seasonName, playerName, update) {
        if (!seasonName) {
            console.error("No season tag provided");
            return;
        }
        seasonName = encodeURIComponent(seasonName);
        return axios
            .post(`${apiRoot}/${seasonName}/player/changesurvivor/`, {
                name: playerName,
                change: update,
            })
            .catch((err) => console.error(err));
    }

    // login player
    static async login(playerName, password) {
        return axios
            .post(`${apiRoot}/player/login`, {
                name: playerName,
                password: password,
            })
            .catch((err) => console.error(err));    
    }

    // auto login player
    static async autoLogin(playerName, rememberMeToken) {
        return axios
            .post(`${apiRoot}/player/login/rememberMe`, {
                name: playerName,
                token: rememberMeToken,
            })
            .catch((err) => console.error(err));
    }

    // update player password
    static async changePassword(
        playerName,
        oldPassword,
        newPassword,
        confirmNewPassword
    ) {
        if (newPassword !== confirmNewPassword) {
            return "Passwords do not match";
        }
        if (newPassword.length < 3) {
            return "Password must be at least 3 characters";
        }

        return axios
            .post(`${apiRoot}/player/changePassword`, {
                playerName,
                oldPassword,
                newPassword,
            })
            .then((res) => {
                if (res.data.error) {
                    return res.data.error;
                }
                return "success";
            })
            .catch((err) => console.error(err));
    }

    // remember me
    static async remberMe(playerName, token) {
        return axios
            .post(`${apiRoot}/player/rememberMe`, {
                playerName,
                token,
            })
            .catch((err) => console.error(err));
    }

    // update player color
    static async updateColor(playerName, newColor) {
        return axios
            .post(`${apiRoot}/player/changeColor`, {
                name: playerName,
                color: newColor,
            })
            .catch((err) => console.error(err));
    }

    // add a new tribe
    static async addTribe(seasonName, newTribe) {
        if (!seasonName) {
            console.error("No season tag provided");
            return;
        }
        seasonName = encodeURIComponent(seasonName);
        return axios
            .post(`${apiRoot}/${seasonName}/tribe/new`, { newTribe })
            .catch((err) => console.error(err));
    }
    //#endregion
}

export default API;
