import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Create the context
const FirestoreContext = createContext(null);

// Custom hook for accessing the context
export function useStore() {
  const contextValue = useContext(FirestoreContext);
  if (!contextValue) {
    throw new Error("useFirestore must be used within a FirestoreProvider");
  }
  return contextValue;
}

// Context provider component
export function Provider({ children }) {


  const [isAdmin, SetAdmin] = useState(
    localStorage.getItem("isAdmin") || false
  );
  console.log(isAdmin)

const [isLogin,setLogin] = useState(localStorage.getItem("isLogin") || false)
  useEffect(() => {
  
    const fetchState = async () => {
        try {
          const response = await axios.get("https://mb-paly-server.onrender.com/state", {
            withCredentials: true,
          });
          if (response) {
            localStorage.setItem("isAdmin", response.data.user.isAdmin);
            localStorage.setItem("isLogin", true);
            SetAdmin(response.data.user.isAdmin);
            setLogin(true)
          }
        } catch (error) {
            localStorage.clear()
          console.error("Error fetching state:", error); // handle error
        }
      };
    
    fetchState();
  }, []);

  const contextValue = { val: 88 }; // Add other shared state or methods here

  return (
    <FirestoreContext.Provider value={{isLogin,isAdmin,setLogin,SetAdmin}}>
      {children}
    </FirestoreContext.Provider>
  );
}
