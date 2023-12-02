import React from "react";
import logo from "../favicon/logo.png";
import coig from "../favicon/loading.gif";

function LoadingPage() {
  return (
    <div className="centered">
      <img className="loading-image" src={logo} alt="logo" />
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
      <img className="loading-image" src={coig} alt="loading" />
    </div>
  );
}

export default LoadingPage;
