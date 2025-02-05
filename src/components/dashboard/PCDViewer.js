import React, { useMemo, useEffect, useState } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader";
import { Box3, Vector3, BufferAttribute, Color, BufferGeometry } from "three";
import { interpolateTurbo } from "d3-scale-chromatic";

const PCDViewer = ({ url, pointSize, colorMode }) => {
  const pointCloud = useLoader(PCDLoader, url);
  const { camera } = useThree();
  const [error, setError] = useState(null);

  const { geometry } = useMemo(() => {
    try {
      const originalGeometry = pointCloud.geometry;
      const originalPositions =
        originalGeometry.attributes.position?.array || [];

      // Filter out invalid points
      const validPositions = [];
      for (let i = 0; i < originalPositions.length; i += 3) {
        const x = originalPositions[i];
        const y = originalPositions[i + 1];
        const z = originalPositions[i + 2];

        if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
          validPositions.push(x, y, z);
        }
      }

      // Handle empty point cloud
      if (validPositions.length === 0) {
        window.dispatchEvent(
          new CustomEvent("updatePointCloudMetadata", {
            detail: { pointCount: 0, boundingBox: "0.00×0.00×0.00" },
          })
        );
        return { geometry: new BufferGeometry() };
      }

      // Create filtered geometry
      const filteredGeometry = new BufferGeometry();
      filteredGeometry.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(validPositions), 3)
      );

      // Calculate bounds
      let minX = Infinity,
        minY = Infinity,
        minZ = Infinity;
      let maxX = -Infinity,
        maxY = -Infinity,
        maxZ = -Infinity;

      const positions = filteredGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        minZ = Math.min(minZ, z);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        maxZ = Math.max(maxZ, z);
      }

      // Calculate dimensions
      const sizeX = Number.isFinite(maxX - minX) ? maxX - minX : 0;
      const sizeY = Number.isFinite(maxY - minY) ? maxY - minY : 0;
      const sizeZ = Number.isFinite(maxZ - minZ) ? maxZ - minZ : 0;

      const boundingBox = `${sizeX.toFixed(2)}×${sizeY.toFixed(
        2
      )}×${sizeZ.toFixed(2)}`;
      const pointCount = positions.length / 3;

      // Dispatch metadata
      window.dispatchEvent(
        new CustomEvent("updatePointCloudMetadata", {
          detail: { pointCount, boundingBox },
        })
      );

      // Calculate colors
      const colors = new Float32Array(positions.length);
      if (colorMode === "altitude" && pointCount > 0) {
        const rangeZ = maxZ - minZ;
        for (let i = 0; i < positions.length; i += 3) {
          const z = positions[i + 2];
          const normalizedZ = rangeZ !== 0 ? (z - minZ) / rangeZ : 0.5;
          const colorStr = interpolateTurbo(normalizedZ);
          const color = new Color(colorStr);
          colors[i] = color.r;
          colors[i + 1] = color.g;
          colors[i + 2] = color.b;
        }
      } else {
        colors.fill(1);
      }

      filteredGeometry.setAttribute("color", new BufferAttribute(colors, 3));
      filteredGeometry.computeBoundingSphere();

      return { geometry: filteredGeometry };
    } catch (error) {
      console.error("PCD processing error:", error);
      setError(error.message);
      return { geometry: new BufferGeometry() };
    }
  }, [pointCloud, colorMode]);

  useEffect(() => {
    if (geometry?.attributes?.position?.array.length > 0) {
      const box = new Box3().setFromBufferAttribute(
        geometry.attributes.position
      );
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3()).length();

      camera.position.set(
        center.x + size * 0.5,
        center.y + size * 0.5,
        center.z + size
      );
      camera.lookAt(center);
      camera.updateProjectionMatrix();
    }
  }, [geometry, camera]);

  if (error)
    return (
      <Html center>
        <div className="error-message">{error}</div>
      </Html>
    );

  return (
    <points>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        size={pointSize}
        vertexColors
        sizeAttenuation
        transparent={false}
      />
    </points>
  );
};

export default PCDViewer;
