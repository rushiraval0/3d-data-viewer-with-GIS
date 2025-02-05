import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import PCDViewer from "./PCDViewer";
import XYZViewer from "./XYZViewer";

const PointCloudViewer = ({ data, pointSize, colorMode }) => {
  useEffect(() => {
    const handleMetadataUpdate = (event) => {
      const { pointCount, boundingBox } = event.detail;
      document
        .querySelector(".sidebar-title")
        ?.closest(".mb-3")
        ?.dispatchEvent(
          new CustomEvent("pointCloudLoaded", {
            detail: { pointCount, boundingBox },
          })
        );
    };

    window.addEventListener("updatePointCloudMetadata", handleMetadataUpdate);
    return () =>
      window.removeEventListener(
        "updatePointCloudMetadata",
        handleMetadataUpdate
      );
  }, []);

  if (!data) {
    return (
      <Canvas style={{ width: "100%", height: "100%" }}>
        <Html>
          <span>Upload a point cloud file to view</span>
        </Html>
      </Canvas>
    );
  }

  const fileExtension = (() => {
    // Try metadata filename first
    if (data.metadata?.name) {
      return data.metadata.name.split(".").pop()?.toLowerCase();
    }

    // Try URL filename
    const urlParts = data.url.split(".");
    if (urlParts.length > 1) {
      return urlParts.pop()?.toLowerCase();
    }

    console.error("Could not detect file extension", data);
    return "";
  })();

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{
          fov: 60,
          near: 0.1,
          far: 1000,
          position: [0, 0, 5],
          up: [0, 0, 1],
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={0.1}
          maxDistance={1000}
          screenSpacePanning={true}
        />
        {fileExtension === "pcd" ? (
          <PCDViewer
            key={`${data.url}-${colorMode}`}
            url={data.url}
            pointSize={pointSize}
            colorMode={colorMode}
          />
        ) : fileExtension === "xyz" ? (
          <XYZViewer
            key={`${data.url}-${colorMode}`}
            url={data.url}
            pointSize={pointSize}
            colorMode={colorMode}
          />
        ) : (
          <Html>
            <span className="text-danger">Unsupported file format</span>
          </Html>
        )}
      </Canvas>
    </div>
  );
};

export default PointCloudViewer;
