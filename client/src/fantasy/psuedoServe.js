import episode1 from "../../../server/data/episodes/episode1";
import episode2 from "../../../server/data/episodes/episode2";
import episode3 from "../../../server/data/episodes/episode3";
import episode4 from "../../../server/data/episodes/episode4";

import aidan from "../../../server/data/players/aidan";
import sarah from "../../../server/data/players/sarah";
import savannah from "../../../server/data/players/savannah";

import andrea from "../../../server/data/survivors/andrea";
import carolyn from "../../../server/data/survivors/carolyn";
import eric from "../../../server/data/survivors/eric";
import john from "../../../server/data/survivors/john";

import ratu from "../../../server/data/tribes/ratu";
import tika from "../../../server/data/tribes/tika";
import soka from "../../../server/data/tribes/soka";

class axios {
  static async get(request) {
    return new Promise((resolve) => {
      switch (request) {
        case "http://localhost:1332/api/episodes":
          resolve({ data: [episode1, episode2, episode3, episode4] });
        case "http://localhost:1332/api/players":
          resolve({ data: [aidan, sarah, savannah] });
        case "http://localhost:1332/api/player/Savannah":
          resolve({ data: [savannah] });
        case "http://localhost:1332/api/player/Aidan":
          resolve({ data: [aidan] });
        case "http://localhost:1332/api/player/Sarah":
          resolve({ data: [sarah] });
        case "http://localhost:1332/api/survivors":
          resolve({ data: [andrea, carolyn, eric, john] });
        case "http://localhost:1332/api/survivor/Andrea Andrews":
          resolve({ data: [andrea] });
        case "http://localhost:1332/api/survivor/Carolyn Wiger":
          resolve({ data: [carolyn] });
        case "http://localhost:1332/api/survivor/Eric Erickson":
          resolve({ data: [eric] });
        case "http://localhost:1332/api/survivor/John Johnson":
          resolve({ data: [john] });
        case "http://localhost:1332/api/tribes":
          resolve({ data: [ratu, soka, tika] });
        case "http://localhost:1332/api/tribe/Tika":
          resolve({ data: [tika] });
        case "http://localhost:1332/api/tribe/Soka":
          resolve({ data: [soka] });
        case "http://localhost:1332/api/tribe/Ratu":
          resolve({ data: [ratu] });
      }
    });
  }
}

export default axios;
