import React, { useState } from "react";
import {
  Button,
  ListGroup,
  ListGroupItem,
  Badge,
  Input,
  ButtonGroup,
} from "reactstrap";
import { useActivity } from "./ActivityContext";

const FileUploadSection = ({
  onFileUpload,
  pointSize,
  setPointSize,
  colorMode,
  setColorMode,
  metadata,
}) => {
  const [error, setError] = useState("");
  const { addActivity } = useActivity();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pcd", "xyz", "json"].includes(ext)) {
      setError("Only .pcd, .xyz, and .geojson files are allowed");
      addActivity({
        type: "error",
        message: `Failed to upload file: ${file.name} - Invalid file type`,
      });
      return;
    }

    setError("");
    try {
      if (ext === "json") {
        // Handle GeoJSON file
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const geojsonData = JSON.parse(e.target.result);
            const initialMetadata = {
              name: file.name,
              size: `${(file.size / 1024).toFixed(2)} KB`,
              type: "GEOJSON",
              features: geojsonData.features.length,
            };

            onFileUpload({
              data: geojsonData,
              metadata: initialMetadata,
            });

            addActivity({
              type: "success",
              message: `Loaded GeoJSON file: ${file.name}`,
            });
          } catch (err) {
            setError("Invalid GeoJSON format");
            addActivity({
              type: "error",
              message: `Failed to parse GeoJSON: ${file.name}`,
            });
          }
        };
        reader.readAsText(file);
      } else {
        // Handle point cloud files (PCD and XYZ)
        const initialMetadata = {
          name: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          type: ext.toUpperCase(),
          pointCount: "Loading...",
          boundingBox: "Calculating...",
        };

        onFileUpload({
          url: URL.createObjectURL(file),
          metadata: initialMetadata,
        });

        addActivity({
          type: "success",
          message: `Loaded point cloud file: ${file.name}`,
        });
      }
    } catch (err) {
      setError("Error processing file");
      addActivity({
        type: "error",
        message: `Failed to process file: ${file.name}`,
      });
    }
  };

  const handlePointSizeChange = (e) => {
    const newSize = parseFloat(e.target.value);
    setPointSize(newSize);
    addActivity({ message: `Changed point size to ${newSize.toFixed(4)}` });
  };

  const handleColorModeChange = (mode) => {
    setColorMode(mode);
    addActivity({ message: `Changed color mode to ${mode}` });
  };

  return (
    <div className="mb-3">
      <h6 className="sidebar-title">Upload Data</h6>
      <div className="d-grid gap-2">
        <Input
          type="file"
          id="file-upload"
          accept=".pcd,.xyz,.json"
          onChange={handleFileUpload}
        />
      </div>

      {error && <div className="text-danger small mt-2">{error}</div>}

      {metadata && (
        <>
          <ListGroup className="mt-3">
            <ListGroupItem>
              <div className="d-flex justify-content-between small">
                <span>Filename:</span>
                <Badge color="primary">{metadata.name}</Badge>
              </div>
              <div className="d-flex justify-content-between small mt-2">
                <span>Type:</span>
                <Badge color="info">{metadata.type}</Badge>
              </div>
              <div className="d-flex justify-content-between small mt-2">
                <span>Size:</span>
                <Badge color="info">{metadata.size}</Badge>
              </div>
              {metadata.pointCount && (
                <div className="d-flex justify-content-between small mt-2">
                  <span>Points:</span>
                  <Badge color="info">{metadata.pointCount}</Badge>
                </div>
              )}
              {metadata.boundingBox && (
                <div className="d-flex justify-content-between small mt-2">
                  <span>Dimensions:</span>
                  <Badge color="info">{metadata.boundingBox}</Badge>
                </div>
              )}
              {metadata.features && (
                <div className="d-flex justify-content-between small mt-2">
                  <span>Features:</span>
                  <Badge color="info">{metadata.features}</Badge>
                </div>
              )}
            </ListGroupItem>
          </ListGroup>

          {/* Only show these controls for point cloud files */}
          {metadata.type && metadata.type !== "GEOJSON" && (
            <div className="mt-4 controls-container">
              <div className="mb-3">
                <label className="text-muted small">
                  Point Size: {pointSize}
                </label>
                <Input
                  type="range"
                  min="0.00001"
                  max="0.02"
                  step="0.0002"
                  value={pointSize}
                  onChange={handlePointSizeChange}
                  className="form-range"
                />
              </div>

              <ButtonGroup className="w-100">
                <Button
                  color={colorMode === "altitude" ? "primary" : "secondary"}
                  onClick={() => handleColorModeChange("altitude")}
                  size="sm"
                >
                  Color by Altitude
                </Button>
                <Button
                  color={colorMode === "white" ? "primary" : "secondary"}
                  onClick={() => handleColorModeChange("white")}
                  size="sm"
                >
                  Single Color
                </Button>
              </ButtonGroup>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileUploadSection;
