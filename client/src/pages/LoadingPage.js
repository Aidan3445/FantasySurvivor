import React from "react";

function LoadingPage() {
  return (
    <div className="centered">
      <img
        className="loading-image"
        src="https://i.imgur.com/PHpPLpm.jpg"
        alt="logo"
      />
      <div className="survivor-body">
        Loading...
        <br />
        This site is hosted using the free tier of Render.com.
        <br />
        The site will take a few seconds to load as the server wakes up.
        <br />
        If the site does not load after a few minutes, please refresh the page.
        <br />
        Thank you for your patience.
        <br />
      </div>
      <img
        className="loading-image"
        src="https://i.imgur.com/W9THp0H.jpg"
        alt="loading"
      />
    </div>
  );
}

export default LoadingPage;
