import React, { useMemo, useEffect, useState } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { XYZLoader } from "three/examples/jsm/loaders/XYZLoader";
import { Box3, Vector3, BufferAttribute, Color } from "three";
import { interpolateTurbo } from "d3-scale-chromatic";

const XYZViewer = ({ url, pointSize, colorMode }) => {
  const { camera } = useThree();
  const [error, setError] = useState(null);

  const geometry = useLoader(XYZLoader, url, (loader) => {
    loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      console.log(
        `Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`
      );
    };
  });

  const processedGeometry = useMemo(() => {
    try {
      // Validate geometry and position attribute
      if (!geometry || !geometry.attributes.position) {
        setError("Invalid geometry or missing position data");
        return null;
      }

      const positions = geometry.attributes.position.array;

      // Check for valid positions
      if (positions.length === 0 || positions.some(isNaN)) {
        setError("Invalid point cloud data");
        return null;
      }

      const pointCount = positions.length / 3;

      // Calculate bounding box
      const box = new Box3().setFromBufferAttribute(
        geometry.attributes.position
      );
      const size = box.getSize(new Vector3());
      const boundingBox = `${size.x.toFixed(2)}×${size.y.toFixed(
        2
      )}×${size.z.toFixed(2)}`;

      // Calculate Z range for coloring
      let minZ = Infinity,
        maxZ = -Infinity;
      for (let i = 2; i < positions.length; i += 3) {
        const z = positions[i];
        if (!isNaN(z)) {
          minZ = Math.min(minZ, z);
          maxZ = Math.max(maxZ, z);
        }
      }

      // Validate Z range
      if (minZ === Infinity || maxZ === -Infinity || minZ === maxZ) {
        setError("Invalid Z coordinates");
        return null;
      }

      // Create color buffer
      const colors = new Float32Array(positions.length);

      if (colorMode === "altitude") {
        for (let i = 0; i < positions.length; i += 3) {
          const z = positions[i + 2];
          const normalizedZ = (z - minZ) / (maxZ - minZ);
          const colorStr = interpolateTurbo(normalizedZ);
          const color = new Color(colorStr);
          colors[i] = color.r;
          colors[i + 1] = color.g;
          colors[i + 2] = color.b;
        }
      } else {
        colors.fill(1);
      }

      const colorAttribute = new BufferAttribute(colors, 3);
      geometry.setAttribute("color", colorAttribute);

      // Dispatch metadata event
      window.dispatchEvent(
        new CustomEvent("updatePointCloudMetadata", {
          detail: { pointCount, boundingBox },
        })
      );

      return geometry;
    } catch (err) {
      setError(`Processing error: ${err.message}`);
      return null;
    }
  }, [geometry, colorMode]);

  useEffect(() => {
    if (processedGeometry) {
      const box = new Box3().setFromBufferAttribute(
        processedGeometry.attributes.position
      );
      const center = box.getCenter(new Vector3());

      camera.position.set(0, 0, 5);

      camera.lookAt(center);
      camera.updateProjectionMatrix();
    }
  }, [processedGeometry, camera]);

  // Error handling
  if (error) {
    console.error("XYZ Loading/Processing Error:", error);
    return (
      <Html position={[0, 0, 0]}>
        <div
          style={{
            color: "red",
            padding: "10px",
            background: "white",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      </Html>
    );
  }

  // No geometry to render
  if (!processedGeometry) return null;

  return (
    <points>
      <primitive object={processedGeometry} attach="geometry" />
      <pointsMaterial
        size={pointSize}
        vertexColors
        sizeAttenuation
        opacity={1.0}
        alphaTest={0.5}
      />
    </points>
  );
};

export default XYZViewer;
