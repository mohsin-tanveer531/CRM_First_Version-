import {
  Drawer,
  
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Toolbar,
  
  List,
  
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon    from "@mui/icons-material/People";
import BuildIcon     from "@mui/icons-material/Build";
import LogoutIcon    from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import "@fontsource/pacifico/400.css";

import { drawerWidth } from "./constants";
import config          from "../config";

export default function Sidebar() {
  const nav = useNavigate();

  /* ───────────────────────── call POST /logout then wipe local-storage */
  const handleLogout = async () => {
    const username = localStorage.getItem("username") ?? "";
    try {
      await fetch(`${config.baseURL}/logout`, {
        method : "POST",
        headers: { "X-Username": username },
      });
    } finally {
      localStorage.clear();
      nav("/login", { replace: true });
    }
  };
  /* ─────────────────────────────────────────────────────────────────── */

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#141414",
          color: "#fff",
        },
      }}
    >
      {/* Brand strip (same height as an AppBar/Toolbar) */}
      <Toolbar sx={{ justifyContent: "center", py: 1.5 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Pacifico", cursive',
            fontWeight: 900,
            letterSpacing: 1.2,
            userSelect: "none",
          }}
        >
          woresk
        </Typography>
      </Toolbar>

      {/* Main navigation */}
      <List disablePadding>
        <ListItemButton onClick={() => nav("/dashboard")}>
          <ListItemIcon sx={{ color: "inherit" }}><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton onClick={() => nav("/manage-users")}>
          <ListItemIcon sx={{ color: "inherit" }}><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Users" />
        </ListItemButton>
        <ListItemButton onClick={() => nav("/processors")}>
   <ListItemIcon sx={{ color: "inherit" }}><BuildIcon /></ListItemIcon>
  <ListItemText primary="Processors" />
</ListItemButton>
        {/* ------------ Logout (hits /logout then redirects) ------------ */}
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon sx={{ color: "inherit" }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
