// ── src/sa/TopBar.tsx ───────────────────────────────────────────────────
import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate }   from "react-router-dom";

import { drawerWidth } from "./constants";
import config           from "../config";

export default function Topbar() {
  const [message, setMessage] = useState("Super Admin");

  /* 🔔 ­un-seen alert counter */
  const [unseen,  setUnseen]  = useState(0);

  const nav = useNavigate();

  /* welcome banner text ---------------------------------------------- */
  useEffect(() => {
    const stored = localStorage.getItem("welcome_message");
    if (stored) setMessage(stored);
  }, []);

  /* poll the backend every 15 s for *newer* activity events ----------- */
  useEffect(() => {
    const poll = async () => {
      const lastSeen =
        localStorage.getItem("last_seen_activity") ?? "1970-01-01T00:00:00Z";

      try {
        const res = await fetch(`${config.baseURL}/activity_logs`);
        if (!res.ok) return; // silent fail
        const data: { timestamp: string }[] = await res.json();

        // how many have a newer timestamp?
        const fresh = data.filter((a) => a.timestamp > lastSeen).length;
        setUnseen(fresh);
      } catch {
        /* network hiccup – ignore */
      }
    };

    poll();                       // initial call
    const id = setInterval(poll, 15_000);
    return () => clearInterval(id);
  }, []);

  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={1}
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        ml: `${drawerWidth}px`,
        width: `calc(100% - ${drawerWidth}px)`,
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {message}
        </Typography>

        {/* 🔔 notification bell + badge -------------------------------- */}
        <IconButton
          size="large"
          aria-label="notifications"
          onClick={() => {
            /* user opened /alerts – mark all as seen */
            localStorage.setItem("last_seen_activity", new Date().toISOString());
            setUnseen(0);
            nav("/alerts");
          }}
        >
          <Badge
            color="error"
            badgeContent={unseen}
            invisible={unseen === 0}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* 👤 avatar → super-admin settings ---------------------------- */}
        <IconButton
          size="large"
          aria-label="super-admin-settings"
          onClick={() => nav("/super-admins")}
        >
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
