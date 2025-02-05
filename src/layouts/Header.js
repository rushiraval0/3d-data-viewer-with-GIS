import React from "react";

// Header.js
const Header = () => {
  return (
    <header
      className="app-header"
      style={{
        backgroundColor: "#1976d2", // The blue color from your image
        color: "white",
        padding: "1rem",
        display: "flex",
        justifyContent: "center", // Centers horizontally
        alignItems: "center", // Centers vertically
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "1.5rem", // Adjust size as needed
        }}
      >
        3D Model and GIS Visualizer
      </h1>
    </header>
  );
};

export default Header;
