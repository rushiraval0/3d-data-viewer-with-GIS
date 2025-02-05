import React, { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import GeoJSON from "ol/format/GeoJSON";
import { defaults as defaultControls } from "ol/control";
import { ZoomSlider, ScaleLine, Zoom } from "ol/control";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import Overlay from "ol/Overlay";
import "ol/ol.css";

const GISViewer = ({ geojson }) => {
  const mapRef = useRef();
  const mapInstance = useRef(null);
  const popupRef = useRef();
  const popupContainerRef = useRef();

  // Style function to handle different geometry types
  const styleFunction = (feature) => {
    const geometry = feature.getGeometry().getType();

    switch (geometry) {
      case "Point":
        return new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: "#FF0000" }),
            stroke: new Stroke({
              color: "#FFFFFF",
              width: 2,
            }),
          }),
        });

      case "LineString":
        return new Style({
          stroke: new Stroke({
            color: "#0000FF",
            width: 3,
          }),
        });

      case "Polygon":
        return new Style({
          stroke: new Stroke({
            color: "#00FF00",
            width: 2,
          }),
          fill: new Fill({
            color: "rgba(0, 255, 0, 0.2)",
          }),
        });

      default:
        return null;
    }
  };

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapInstance.current) {
      // Create vector source and layer for GeoJSON data
      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: styleFunction,
      });

      // Create popup overlay
      const popup = new Overlay({
        element: popupRef.current,
        positioning: "bottom-center",
        offset: [0, -10],
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });

      // Initialize map
      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          vectorLayer,
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
          projection: "EPSG:3857",
        }),
        controls: defaultControls().extend([
          new ZoomSlider(),
          new ScaleLine(),
          new Zoom(),
        ]),
      });

      mapInstance.current.addOverlay(popup);

      // Add click handler for features
      mapInstance.current.on("click", (event) => {
        const feature = mapInstance.current.forEachFeatureAtPixel(
          event.pixel,
          (feature) => feature
        );

        if (feature) {
          let coordinates;
          const geometry = feature.getGeometry().getType();
          const properties = feature.getProperties();

          // Get coordinates based on geometry type
          switch (geometry) {
            case "Point":
              coordinates = feature.getGeometry().getCoordinates();
              break;
            case "LineString":
            case "Polygon":
              coordinates = event.coordinate;
              break;
            default:
              return;
          }

          // Create popup content
          const content = `
            <div class="ol-popup">
              <h4>Feature Details</h4>
              <p><strong>Type:</strong> ${geometry}</p>
              ${Object.entries(properties)
                .filter(([key]) => key !== "geometry")
                .map(
                  ([key, value]) => `
                  <p><strong>${key}:</strong> ${
                    typeof value === "object" ? JSON.stringify(value) : value
                  }</p>
                `
                )
                .join("")}
            </div>
          `;

          popupContainerRef.current.innerHTML = content;
          popup.setPosition(coordinates);
        } else {
          popup.setPosition(undefined);
        }
      });

      // Change cursor on hover
      mapInstance.current.on("pointermove", (event) => {
        const hit = mapInstance.current.hasFeatureAtPixel(event.pixel);
        mapInstance.current.getTarget().style.cursor = hit ? "pointer" : "";
      });
    }

    // Update vector source when geojson changes
    if (mapInstance.current && geojson) {
      const vectorLayer = mapInstance.current.getLayers().getArray()[1];
      const vectorSource = vectorLayer.getSource();
      vectorSource.clear();

      try {
        // Transform GeoJSON coordinates to map projection
        const features = new GeoJSON().readFeatures(geojson, {
          featureProjection: "EPSG:3857",
        });
        vectorSource.addFeatures(features);

        // Fit view to features extent
        const extent = vectorSource.getExtent();
        mapInstance.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
          maxZoom: 16,
        });
      } catch (error) {
        console.error("Error parsing GeoJSON:", error);
      }
    }

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(null);
        mapInstance.current = null;
      }
    };
  }, [geojson]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <div ref={popupRef} className="ol-popup-container">
        <div ref={popupContainerRef} className="ol-popup-content"></div>
      </div>
      <style>
        {`
          .ol-popup-container {
            position: absolute;
            background-color: white;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            padding: 15px;
            border-radius: 10px;
            border: 1px solid #cccccc;
            bottom: 12px;
            left: -50px;
            min-width: 280px;
            display: none;
          }
          
          .ol-popup-container:not(:empty) {
            display: block;
          }
          
          .ol-popup {
            font-family: Arial, sans-serif;
            font-size: 14px;
          }
          
          .ol-popup h4 {
            margin: 0 0 10px 0;
            color: #333;
          }
          
          .ol-popup p {
            margin: 5px 0;
            font-size: 12px;
          }
        `}
      </style>
    </div>
  );
};

export default GISViewer;
