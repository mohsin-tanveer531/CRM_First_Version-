// src/routes/Login.tsx
import { useState, type FormEvent, type ChangeEvent } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PublicIcon from "@mui/icons-material/Public";
import { useNavigate } from "react-router-dom";
import config from "../config";

interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  message: string;
  role: string;
}

export default function Login() {
  const navigate = useNavigate();

  // ─── LOGIN STATE ─────────────────────────────────────────────────────────
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // ─── GLOBAL SNACKBAR ──────────────────────────────────────────────────────
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMsg("");
  };

  // ─── SUPER-ADMIN CREATION ─────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateOpen = () => {
    setCreateError(null);
    setNewUsername("");
    setNewPassword("");
    setCreateOpen(true);
  };
  const handleCreateClose = () => setCreateOpen(false);

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (newUsername.length < 3 || newPassword.length < 8) {
      setCreateError("Username ≥3 chars and password ≥8 chars required.");
      return;
    }
    setCreateLoading(true);
    try {
      const resp = await fetch(`${config.baseURL}/super_admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const msgs = Array.isArray((err as any).detail)
          ? (err as any).detail.map((i: any) => i.msg).join(" | ")
          : (err as any).detail || (err as any).message || `Error ${resp.status}`;
        throw new Error(msgs);
      }
      setCreateOpen(false);
      setSnackbarMsg("Super-Admin created successfully.");
      setSnackbarOpen(true);
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // ─── IP-WHITELIST CREATION ────────────────────────────────────────────────
  const [ipOpen, setIpOpen] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [newIpDescription, setNewIpDescription] = useState("");
  const [ipPassword, setIpPassword] = useState("");
  const [ipError, setIpError] = useState<string | null>(null);
  const [ipLoading, setIpLoading] = useState(false);

  const handleIpOpen = () => {
    setIpError(null);
    setNewIp("");
    setNewIpDescription("");
    setIpPassword("");
    setIpOpen(true);
  };
  const handleIpClose = () => setIpOpen(false);

  const handleIpChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "ip_address") setNewIp(value);
    if (name === "description") setNewIpDescription(value);
    if (name === "password") setIpPassword(value);
  };

  const handleIpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIpError(null);
    if (!newIp || !ipPassword) {
      setIpError("IP address and password are required.");
      return;
    }
    setIpLoading(true);
    try {
      const resp = await fetch(`${config.baseURL}/ip_whitelist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip_address: newIp,
          description: newIpDescription,
          password: ipPassword,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as any).detail || (err as any).message || `Error ${resp.status}`);
      }
      setIpOpen(false);
      setSnackbarMsg("IP whitelisted successfully.");
      setSnackbarOpen(true);
    } catch (err: any) {
      setIpError(err.message);
    } finally {
      setIpLoading(false);
    }
  };

  // ─── LOGIN SUBMIT ─────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    if (loginUsername.length < 3 || loginPassword.length < 8) {
      setLoginError("Username ≥3 chars and password ≥8 chars required.");
      setLoginLoading(false);
      return;
    }
    try {
      const resp = await fetch(`${config.baseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as any).detail || (err as any).message || `Invalid credentials`);
      }
      const data: LoginResponse = await resp.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);
      localStorage.setItem("username",      data.username);
      localStorage.setItem("welcome_message", data.message);
      localStorage.setItem("role", data.role);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setLoginError(err.message);
      setSnackbarMsg(err.message);
      setSnackbarOpen(true);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      {/* FULL‐SCREEN CONTAINER */}
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* LOGIN CARD */}
        <Paper elevation={4} sx={{ width: 360, p: 4, borderRadius: 2, position: "relative" }}>
          {/* ADD IP ICON */}
          <IconButton
            onClick={handleIpOpen}
            color="secondary"
            sx={{ position: "absolute", top: 16, right: 56 }}
            aria-label="Whitelist IP"
          >
            <PublicIcon />
          </IconButton>

          {/* CREATE SUPER‐ADMIN ICON */}
          <IconButton
            onClick={handleCreateOpen}
            color="primary"
            sx={{ position: "absolute", top: 16, right: 16 }}
            aria-label="Create Super-Admin"
          >
            <AddIcon />
          </IconButton>

          {/* TITLE */}
          <Typography variant="h5" align="center" gutterBottom sx={{ mb: 2 }}>
            Super Admin Login
          </Typography>

          {/* LOGIN FORM */}
          <Box component="form" onSubmit={handleLoginSubmit} noValidate>
            <TextField
              label="Username"
              placeholder="Enter username (≥3 characters)"
              variant="outlined"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Password"
              placeholder="Enter password (≥8 characters)"
              type="password"
              variant="outlined"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            {loginError && (
              <Typography color="error" variant="body2" sx={{ mt: 1, mb: 1 }}>
                {loginError}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              color="warning"
              fullWidth
              size="large"
              disabled={loginLoading || loginUsername.length < 3 || loginPassword.length < 8}
              sx={{ mt: 2 }}
            >
              {loginLoading ? "Signing in…" : "Sign In"}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* CREATE SUPER‐ADMIN DIALOG */}
      <Dialog open={createOpen} onClose={handleCreateClose}>
        <DialogTitle>Create Super-Admin</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateSubmit} sx={{ display: "flex", flexDirection: "column", width: 360, p: 1 }}>
            <TextField
              label="Username"
              placeholder="Enter username (≥3 characters)"
              fullWidth
              margin="dense"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
            <TextField
              label="Password"
              placeholder="Enter password (≥8 characters)"
              type="password"
              fullWidth
              margin="dense"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {createError && (
              <Typography color="error" variant="body2" sx={{ mt: 1, mb: 1 }}>
                {createError}
              </Typography>
            )}
            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button onClick={handleCreateClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={createLoading || newUsername.length < 3 || newPassword.length < 8}
              >
                {createLoading ? "Adding…" : "Add Super-Admin"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ADD IP DIALOG */}
      <Dialog open={ipOpen} onClose={handleIpClose} fullWidth>
        <DialogTitle>Whitelist New IP</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleIpSubmit} sx={{ display: "flex", flexDirection: "column", p: 1 }}>
            <TextField
              label="IP Address"
              name="ip_address"
              placeholder="e.g. 192.168.1.118"
              value={newIp}
              onChange={handleIpChange}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Description"
              name="description"
              placeholder="Optional note"
              value={newIpDescription}
              onChange={handleIpChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Admin Password"
              name="password"
              type="password"
              placeholder="Enter admin password"
              value={ipPassword}
              onChange={handleIpChange}
              fullWidth
              margin="dense"
              required
            />
            {ipError && (
              <Typography color="error" variant="body2" sx={{ mt: 1, mb: 1 }}>
                {ipError}
              </Typography>
            )}
            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button onClick={handleIpClose}>Cancel</Button>
              <Box sx={{ position: "relative" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={ipLoading || !newIp || !ipPassword}
                >
                  {ipLoading ? "Whitelisting…" : "Whitelist IP"}
                </Button>
                {ipLoading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                )}
              </Box>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* GLOBAL SNACKBAR */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
