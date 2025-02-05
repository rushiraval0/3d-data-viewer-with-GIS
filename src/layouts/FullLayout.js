import { useState, useEffect } from "react";
import { Container } from "reactstrap";
import PointCloudViewer from "../components/dashboard/PointCloudViewer";
import GISViewer from "../components/dashboard/GISViewer";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

const FullLayout = () => {
  const [pointCloudData, setPointCloudData] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [viewerMode, setViewerMode] = useState("pointcloud");
  const [pointSize, setPointSize] = useState(0.001);
  const [colorMode, setColorMode] = useState("altitude");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cleanupData = () => {
    if (pointCloudData?.url) {
      URL.revokeObjectURL(pointCloudData.url);
    }
    setPointCloudData(null);
    setGeojsonData(null);
  };

  const handleViewerModeChange = (newMode) => {
    setViewerMode(newMode);
    cleanupData();
  };

  useEffect(() => {
    const handlePointCloudLoaded = (event) => {
      const { pointCount, boundingBox } = event.detail;
      console.log("Received metadata update:", event.detail);
      setPointCloudData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          metadata: {
            ...prev.metadata,
            pointCount: pointCount.toLocaleString(),
            boundingBox,
          },
        };
      });
    };

    window.addEventListener("updatePointCloudMetadata", handlePointCloudLoaded);
    return () => {
      window.removeEventListener(
        "updatePointCloudMetadata",
        handlePointCloudLoaded
      );
      cleanupData();
    };
  }, []);

  const handleFileUpload = async (result) => {
    setIsLoading(true);
    setError(null);
    cleanupData();

    try {
      if (!result?.metadata) throw new Error("Invalid file data");

      if (result.metadata.type === "GEOJSON") {
        setGeojsonData({
          type: "GEOJSON",
          data: result.data,
          metadata: result.metadata,
        });
        setViewerMode("geojson");
      } else {
        setPointCloudData({
          type: result.metadata.type,
          url: result.url,
          metadata: {
            ...result.metadata,
            pointCount: "Loading...",
            boundingBox: "Calculating...",
          },
        });
        setViewerMode("pointcloud");
      }
    } catch (err) {
      console.error("Error loading file:", err);
      setError(`Error loading file: ${err.message}`);
      cleanupData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewerError = (error) => {
    console.error("Viewer error:", error);
    setError(`Error displaying file: ${error.message}`);
    setIsLoading(false);
  };

  const renderLoading = () => (
    <div className="d-flex justify-content-center align-items-center h-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="d-flex justify-content-center align-items-center h-100 text-danger">
      <div>{error}</div>
    </div>
  );

  const renderEmpty = () => (
    <div className="d-flex justify-content-center align-items-center h-100 text-muted">
      <div>Upload a file to begin viewing</div>
    </div>
  );

  const handleMetadataUpdate = (metadata) => {
    setPointCloudData((prev) =>
      prev
        ? {
            ...prev,
            metadata: {
              ...prev.metadata,
              ...metadata,
            },
          }
        : prev
    );
  };

  const renderViewer = () => {
    if (isLoading) return renderLoading();
    if (error) return renderError();

    switch (viewerMode) {
      case "pointcloud":
        return pointCloudData ? (
          <div style={{ width: "100%", height: "100%" }}>
            <PointCloudViewer
              data={pointCloudData}
              pointSize={pointSize}
              colorMode={colorMode}
              onError={handleViewerError}
              onMetadataUpdate={handleMetadataUpdate}
            />
          </div>
        ) : (
          renderEmpty()
        );

      case "geojson":
        return (
          <div style={{ width: "100%", height: "100%" }}>
            <GISViewer
              geojson={geojsonData?.data}
              onError={handleViewerError}
            />
          </div>
        );

      default:
        return renderEmpty();
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Header />
      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          marginBottom: "60px", // Add margin to account for footer height
        }}
      >
        <aside className="sidebarArea shadow" id="sidebarArea">
          <Sidebar
            onFileUpload={handleFileUpload}
            pointSize={pointSize}
            setPointSize={setPointSize}
            colorMode={colorMode}
            setColorMode={setColorMode}
            isLoading={isLoading}
            viewerMode={viewerMode}
            setViewerMode={handleViewerModeChange}
            metadata={
              viewerMode === "pointcloud"
                ? pointCloudData?.metadata
                : geojsonData?.metadata
            }
          />
        </aside>

        <div
          style={{
            flex: 1,
            padding: "20px",
            display: "flex",
            overflow: "hidden",
          }}
        >
          <Container
            className="p-4 bg-light rounded shadow-sm"
            fluid
            style={{
              height: "100%",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              marginBottom: "20px", // Additional spacing from container bottom
            }}
          >
            {renderViewer()}
          </Container>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FullLayout;
