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

    playersSeasons(name) {
        this.requests.playersSeasons = `${apiRoot}/playersSeasons/${name}`;
        return this;
    }

    episodes(seasonName) {
        if (!seasonName) {
            console.error("No season tag provided");
            return this;
        }
        const seasonURI = encodeURIComponent(seasonName);
        this.requests.episodes = `${apiRoot}/${seasonURI}/episodes`;
        return this;
    }

    survivors(seasonName, name) {
        if (!seasonName) {
            console.error("No season tag provided");
            return this;
        }
        const seasonURI = encodeURIComponent(seasonName);
        this.requests.survivors = `${apiRoot}/${seasonURI}/survivor${name ? `/${name}` : "s"}`;
        return this.episodes(seasonName).tribes(seasonName);
    }

    players(seasonName, name) {
        if (!seasonName) {
            console.error("No season tag provided");
            return this;
        }
        const seasonURI = encodeURIComponent(seasonName);
        this.requests.players = `${apiRoot}/${seasonURI}/player${name ? `/${name}` : "s"}`;
        return this.survivors(seasonName);
    }

    tribes(seasonName) {
        if (!seasonName) {
            console.error("No season tag provided");
            return this;
        }
        const seasonURI = encodeURIComponent(seasonName);
        this.requests.tribes = `${apiRoot}/${seasonURI}/tribes`;
        return this;
    }

    get(seasonName) {
        if (!seasonName) {
            console.error("No season tag provided");
            return this;
        }
        return this.players(seasonName);
    }

    playerIsAdmin(name) {
        this.requests.playerIsAdmin = `${apiRoot}/player/${name}/isAdmin`;
        return this;
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
    static async updateSurvivorPick(seasonName, name, change) {
        if (!seasonName) {
            console.error("No season tag provided");
            return;
        }
        seasonName = encodeURIComponent(seasonName);
        return axios
            .post(`${apiRoot}/${seasonName}/player/changesurvivor/`, {
                name,
                update: change,
            })
            .catch((err) => console.error(err));
    }

    // login player
    static async login(name, password) {
        return axios
            .post(`${apiRoot}/player/login`, {
                name,
                password,
            })
            .catch((err) => {
                console.error(err)
                return err;
            });
    }

    // auto login player
    static async autoLogin() {
        const name = localStorage.getItem("playerName");
        const token = localStorage.getItem("rememberMeToken");
        if (!(name && token)) {
            return;
        }
        return axios
            .post(`${apiRoot}/player/login/rememberMe`, {
                name,
                token
            })
            .catch((err) => console.error(err));
    }

    // update player password
    static async changePassword(
        name,
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
                name,
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
    static async remberMe(name, token) {
        return axios
            .post(`${apiRoot}/player/rememberMe`, {
                name,
                token,
            })
            .catch((err) => console.error(err));
    }

    // update player color
    static async updateColor(seasonName, name, newColor) {
        if (!seasonName) {
            console.error("No season tag provided");
            return;
        }
        const seasonURI = encodeURIComponent(seasonName);
        return axios
            .post(`${apiRoot}/${seasonURI}/player/changeColor`, {
                name,
                newColor,
            })
            .catch((err) => console.error(err));
    }

    // add a new tribe
    static async addTribe(seasonName, newTribe, survivors) {
        if (!seasonName) {
            console.error("No season tag provided");
            return;
        }
        seasonName = encodeURIComponent(seasonName);
        return axios
            .post(`${apiRoot}/${seasonName}/tribe/new`, { newTribe, survivors })
            .catch((err) => console.error(err));
    }

    // a new survivor
    static async addSurvivor(seasonName, newSurvivor) {
        if (!seasonName) {
            console.error("No season tag provided");
            return;
        }
        seasonName = encodeURIComponent(seasonName);
        return axios
            .post(`${apiRoot}/${seasonName}/survivor/new`, { ...newSurvivor })
            .catch((err) => console.error(err));
    }
    //#endregion
}

export default API;
