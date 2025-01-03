import React, { useState } from "react";
import { createBrowserRouter, RouterProvider,Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import Home from "./Pages/Home";
import { useStore } from "./Store";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true); // Set this based on user's preference
  const {isLogin}  =useStore()
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
    },
  });

  const Protect = ({ children, to }) => {
    const { isLogin } = useStore();
    return isLogin ? children : <Navigate to={to} />;
  };
  
  const Gost = ({ children, to }) => {
    const { isLogin } = useStore();
    return !isLogin ? children : <Navigate to={to} />;
  };
  
  const router = createBrowserRouter([
    {
      path: "/login",
      element: (
        <Gost to="/">
          <LoginPage />
        </Gost>
      ),
    },
    {
      path: "/signup",
      element: (
        <Gost to="/">
          <SignupPage />
        </Gost>
      ),
    },
    {
      path: "/",
      element: (
        <Protect to="/login">
          <Home />
        </Protect>
      ),
    },
  ]);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Applies global theme styles */}
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
