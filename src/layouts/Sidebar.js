// Sidebar.js
import { useState } from "react";
import {
  Nav,
  NavItem,
  ButtonGroup,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { useActivity } from "../components/dashboard/ActivityContext";
import FileUploadSection from "../components/dashboard/FileUploadSection";

const Sidebar = ({
  onFileUpload,
  pointSize,
  setPointSize,
  colorMode,
  setColorMode,
  isLoading,
  viewerMode,
  setViewerMode,
  metadata,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingViewerMode, setPendingViewerMode] = useState(null);
  const { addActivity } = useActivity();

  const handleModeChange = (newMode) => {
    if (metadata && newMode !== viewerMode) {
      setPendingViewerMode(newMode);
      setIsModalOpen(true);
    } else {
      setViewerMode(newMode);
      addActivity({ message: `Switched to ${newMode} mode` });
    }
  };

  const handleConfirmChange = () => {
    if (pendingViewerMode) {
      setViewerMode(pendingViewerMode);
      addActivity({ message: `Switched to ${pendingViewerMode} mode` });
      setPendingViewerMode(null);
      setIsModalOpen(false);
    }
  };

  const handleCancelChange = () => {
    setPendingViewerMode(null);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="d-flex align-items-center"></div>
      <div className="profilebg"></div>
      <div className="p-3 mt-2">
        <Nav vertical className="sidebarNav">
          <NavItem className="sidenav-bg mb-3">
            <ButtonGroup className="w-100">
              <Button
                color={viewerMode === "pointcloud" ? "primary" : "secondary"}
                onClick={() => handleModeChange("pointcloud")}
                size="sm"
              >
                Point Cloud
              </Button>
              <Button
                color={viewerMode === "geojson" ? "primary" : "secondary"}
                onClick={() => handleModeChange("geojson")}
                size="sm"
              >
                GeoJSON
              </Button>
            </ButtonGroup>
          </NavItem>
          <NavItem className="sidenav-bg">
            <FileUploadSection
              onFileUpload={onFileUpload}
              pointSize={pointSize}
              setPointSize={setPointSize}
              colorMode={colorMode}
              setColorMode={setColorMode}
              metadata={metadata}
            />
          </NavItem>
        </Nav>

        <Modal isOpen={isModalOpen} toggle={handleCancelChange} centered={true}>
          <ModalHeader
            toggle={handleCancelChange}
            className="bg-primary text-white"
          >
            Confirm Mode Change
          </ModalHeader>
          <ModalBody>
            Switching modes will discard the current model. Are you sure you
            want to continue?
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={handleCancelChange}>
              No, Keep Current
            </Button>
            <Button color="primary" onClick={handleConfirmChange}>
              Yes, Switch Mode
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default Sidebar;
