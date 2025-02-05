import React, { Suspense } from "react";
// import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./assets/scss/style.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Loader from "./layouts/loader/Loader";
import "bootstrap/dist/css/bootstrap.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <Suspense fallback={<Loader />}>
    <App />
  </Suspense>
);

reportWebVitals();
