import React from "react";
import { Navbar, Button, ListGroup, ListGroupItem } from "reactstrap";
import { useActivity } from "../components/dashboard/ActivityContext";

const Footer = () => {
  const { activities, clearActivities } = useActivity();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const [isOpen, setIsOpen] = React.useState(false);

  const Handletoggle = () => {
    setIsOpen(!isOpen);
  };

  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };

  return (
    <Navbar
      color="primary"
      dark
      expand="md"
      className="fixed-bottom"
      style={{
        transition: "max-height 0.3s ease-in-out",
        maxHeight: isExpanded ? "300px" : "60px",
        overflow: "hidden",
      }}
    >
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex justify-content-between w-10">
            <Button
              color="primary"
              className=" d-lg-none"
              onClick={() => showMobilemenu()}
            >
              <i className="bi bi-list"></i>
            </Button>
          </div>

          <Button
            color="light"
            size="sm"
            className="me-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide History" : "Show History"}
          </Button>

          <div className="text-white flex-grow-1 mx-3">
            {!isExpanded && (
              <h6 className="mb-0">
                {activities[0]?.message || "No recent activity"}
              </h6>
            )}
          </div>

          <Button
            color="light"
            size="sm"
            className="me-2"
            onClick={clearActivities}
            disabled={activities.length === 0}
          >
            Clear History
          </Button>
        </div>

        {isExpanded && activities.length > 0 && (
          <ListGroup
            className="mt-3 mb-2"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {activities.map((activity) => (
              <ListGroupItem
                key={activity.id}
                className="d-flex justify-content-between align-items-center bg-transparent text-white border-white/10"
              >
                <span>{activity.message}</span>
                <small className="text-white-50">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </small>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
      </div>
    </Navbar>
  );
};

export default Footer;
