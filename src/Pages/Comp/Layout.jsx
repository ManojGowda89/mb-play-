import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";  // Import axios
import { useStore } from "../../Store";

export default function Layout({ children, footerText = "Designed and Developed by Manoj" }) {
  const navigate = useNavigate(); // Hook to navigate programmatically
const {setLogin,isLogin}=useStore()
  const Navbar = () => {
    const handleLogout = async () => {
      try {
        // Call the logout API using Axios
        await axios.get("http://localhost:5000/logout",{
            withCredentials: true,
        });

        setLogin(false)
        localStorage.clear();

        // Navigate to the login page
        navigate("/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Video Gallery
          </Typography>
        {isLogin?  <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button> :
         <Button
         component={RouterLink}
         to="/signup"
         variant="contained"
         color="primary"
         style={{ textTransform: 'none' }}
       >
         Signup
       </Button>}
        </Toolbar>
      </AppBar>
    );
  };

  const Footer = () => (
    <Box
      sx={{
        backgroundColor: "#272727",
        padding: "10px",
        textAlign: "center",
        marginTop: "auto",
      }}
    >
      <Typography variant="body2">{footerText}</Typography>
      <Typography variant="body2">
        © 2025 manojgowda.in. All Rights Reserved.
      </Typography>
    </Box>
  );

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "550px" }}>{children}</main>
      <Footer />
    </>
  );
}
