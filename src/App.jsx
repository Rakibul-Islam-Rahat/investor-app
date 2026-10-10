import { useContext } from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeContext } from "./context";
import { router } from "./app/router";

export default function App() {
  const { darkMode } = useContext(ThemeContext);
  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <RouterProvider router={router} />
    </div>
  );
}
