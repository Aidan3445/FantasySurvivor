import axios from "axios";

const apiRoot =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_ROOT
    : process.env.REACT_APP_API_ROOT_DEV;

class API {
  constructor() {
    this.requests = {};
  }

  //#region REQUEST DATA
  episodes() {
    this.requests.episodeData = `${apiRoot}episodes`;
    return this;
  }

  survivors(name) {
    this.requests.survivorData = `${apiRoot}survivor${name ? `/${name}` : "s"}`;
    return this.episodes().tribes();
  }

  players(name) {
    this.requests.playerData = `${apiRoot}player${name ? `/${name}` : "s"}`;
    return this.survivors();
  }

  tribes() {
    this.requests.tribeData = `${apiRoot}tribes`;
    return this;
  }

  all() {
    return this.episodes().survivors().players().tribes();
  }

  login(playerName, password) {
    this.requests.login = `${apiRoot}player/${playerName}/login/${password}`;
    return this;
  }

  autoLogin() {
    var playerName = localStorage.getItem("playerName");
    var rememberMeToken = localStorage.getItem("rememberMeToken");
    if (playerName && rememberMeToken) {
      this.requests.login = `${apiRoot}player/${playerName}/rememberMe/${rememberMeToken}`;
      return this;
    }
    return this;
  }

  async newRequest() {
    var requests = Object.keys(this.requests);
    var responses = await Promise.all(
      requests.map((r) => axios.get(this.requests[r]))
    ).catch((err) => console.log(err));

    var data = {};
    for (var i = 0; i < requests.length; i++) {
      data[requests[i]] = responses[i].data;
    }
    return data;
  }
  //#endregion

  //#region WRITE DATA
  // add new episode
  static async addEpisode(newEpisode) {
    return axios
      .post(`${apiRoot}episode/new`, newEpisode)
      .catch((err) => console.log(err));
  }

  // update episode
  static async updateEpisode(updatedEpisode) {
    return axios
      .post(`${apiRoot}episode/update`, updatedEpisode)
      .catch((err) => console.log(err));
  }

  // submit draft picks
  static async submitDraft(playerName, draftPicks) {
    return axios
      .post(`${apiRoot}player/${playerName}/draft`, draftPicks)
      .catch((err) => console.log(err));
  }

  // update player survivor pick
  static async updateSurvivorPick(playerName, survivorName) {
    return axios
      .post(`${apiRoot}player/${playerName}/changesurvivor/${survivorName}`)
      .catch((err) => console.log(err));
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
      .post(`${apiRoot}player/${playerName}/password`, {
        oldPassword,
        newPassword,
      })
      .then((res) => {
        if (res.data.error) {
          return res.data.error;
        }
        return "success";
      })
      .catch((err) => console.log(err));
  }

  // remember me
  static async remberMe(playerName, token) {
    return axios
      .post(`${apiRoot}player/${playerName}/rememberMe`, {
        token,
      })
      .catch((err) => console.log(err));
  }

  // update player color
  static async updateColor(playerName, newColor) {
    return axios
      .post(`${apiRoot}player/${playerName}/color`, {
        newColor,
      })
      .catch((err) => console.log(err));
  }

  // add a new tribe
  static async addTribe(newTribe) {
    var { tribeName, tribeColor } = newTribe;
    return axios
      .post(`${apiRoot}tribe/new/${tribeName}`, { tribeColor })
      .catch((err) => console.log(err));
  }
  //#endregion
}

export default API;
