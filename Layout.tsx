// src/components/Layout.tsx
import type { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  IconButton,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon    from '@mui/icons-material/People';
import LogoutIcon    from '@mui/icons-material/Logout';
import SearchIcon    from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

/**
 * Main application layout (sidebar + top bar + routed content).
 * The explicit ReactNode return type keeps TS happy
 * and makes use of the imported `ReactNode`.
 */
export default function Layout(): ReactNode {
  const nav = useNavigate();
  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* ─── TOP BAR ───────────────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        sx={{ ml: drawerWidth, width: `calc(100% - ${drawerWidth}px)` }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Super Admin
          </Typography>
          <IconButton size="large" edge="end">
            <SearchIcon />
          </IconButton>
          <IconButton size="large" edge="end">
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ─── SIDE DRAWER ───────────────────────────────────────────────────── */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar /> {/* pushes list below the AppBar height */}
        <List disablePadding>
          <ListItemButton onClick={() => nav('/dashboard')}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton onClick={() => nav('/manage-users')}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              localStorage.clear();
              nav('/login');
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>

      {/* ─── MAIN CONTENT (router outlet) ──────────────────────────────────── */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* spacer equal to AppBar height */}
        <Outlet />
      </Box>
    </Box>
  );
}
