import { useLocation } from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar/Sidebar";
import AppRouter from "./routes/AppRouter";

function App() {
  const location = useLocation();

  const noLayoutPages = ["/login", "/register"];
  const showLayout = !noLayoutPages.includes(location.pathname);

  return (
    <div className="d-flex min-vh-100">
      {showLayout && (
        <aside className="sticky-top vh-100" style={{ width: "280px" }}>
          <Sidebar />
        </aside>
      )}

      <main className="flex-grow-1 p-0">
        <AppRouter />
      </main>
    </div>
  );
}

export default App;
