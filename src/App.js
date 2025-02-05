import { ActivityProvider } from "./components/dashboard/ActivityContext";
import FullLayout from "./layouts/FullLayout";

const App = () => {
  return (
    <ActivityProvider>
      <div className="dark">
        <FullLayout />
      </div>
    </ActivityProvider>
  );
};

export default App;
