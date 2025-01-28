import React from "react";
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link to="/" style={{ display: "flex" }}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/archive/2/2a/20160616034026%21Instagram_logo.svg/120px-Instagram_logo.svg.png"
        alt="logo"
      />
    </Link>
  );
};