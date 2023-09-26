import episodes from "../../../server/data/episodes.json";
import players from "../../../server/data/players.json";
import survivors from "../../../server/data/survivors.json";
import tribes from "../../../server/data/tribes.json";

// This is a psuedo axios file that will be used to mock the axios calls for testing and offline development
class axios {
  static async get(request) {
    return new Promise((resolve) => {
      switch (request) {
      }
    });
  }
}

export default axios;
