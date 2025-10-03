/* ── src/routes/Alerts.tsx ─────────────────────────────────────────────── */
import { useEffect, useState } from 'react';
import {
  Box, Button, Chip, CircularProgress, Container, IconButton, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography,
} from '@mui/material';
import DeleteIcon        from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import Sidebar from '../sa/Sidebar';
import Topbar  from '../sa/TopBar';
import { drawerWidth } from '../sa/constants';
import config from '../config';

/* ── types ─────────────────────────────────────────────────────────────── */
type Alert = {
  id:        number;
  event:     string;
  username:  string | null;
  ip_addr:   string;
  timestamp: string;        // ISO
};

/* ── component ─────────────────────────────────────────────────────────── */
export default function Alerts() {
  const [alerts,  setAlerts]  = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState<string | null>(null);

  /* ------------------------------------------------ fetch helpers */
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${config.baseURL}/activity_logs`);
      if (!res.ok) throw new Error(`GET failed (${res.status})`);
      const data: Alert[] = await res.json();
      setAlerts(data);

      /* 🆕 store newest timestamp → “last_seen_activity” -------------- */
      if (data.length) {
        localStorage.setItem('last_seen_activity', data[0].timestamp);
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  /* ------------------------------------------------ row helpers */
  const niceLabel  = (ev: string) => ev.replace(/[_-]/g, ' ');
  const chipColour = (ev: string) =>
    ev.startsWith('login-success') ? 'success'
    : ev.startsWith('login-failed') ? 'error'
    : ('default' as const);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this log entry?')) return;
    const res = await fetch(`${config.baseURL}/activity_logs/${id}`, { method: 'DELETE' });
    if (res.ok) setAlerts(a => a.filter(x => x.id !== id));
  };

  const handleDeleteAll = async () => {
    if (!confirm('⚠  Delete ALL activity logs?')) return;
    const res = await fetch(`${config.baseURL}/activity_logs/`, { method: 'DELETE' });
    if (res.ok) {
      setAlerts([]);
      /* 🆕 clear badge immediately ---------------------------------- */
      localStorage.setItem('last_seen_activity', new Date().toISOString());
    }
  };

  /* ── JSX ─────────────────────────────────────────────────────────────── */
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Topbar />

      <Container
        maxWidth="lg"
        component="main"
        sx={{ flexGrow: 1, mt: 10, ml: `${drawerWidth}px`, mb: 4 }}
      >
        {/* title + “delete all” */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            System Activity
          </Typography>

          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteForeverIcon />}
            disabled={alerts.length === 0}
            onClick={handleDeleteAll}
          >
            Delete&nbsp;All
          </Button>
        </Box>

        {loading && <CircularProgress />}
        {err && <Typography color="error" mb={2}>{err}</Typography>}

        {!loading && !err && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time&nbsp;(UTC)</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>IP&nbsp;Address</TableCell>
                  <TableCell align="center" sx={{ width: 70 }} />
                </TableRow>
              </TableHead>

              <TableBody>
                {alerts.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      {new Date(a.timestamp).toISOString()
                        .replace('T', ' ').slice(0, 19)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={niceLabel(a.event)}
                        color={chipColour(a.event)}
                      />
                    </TableCell>

                    <TableCell>{a.username ?? '—'}</TableCell>
                    <TableCell>{a.ip_addr}</TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(a.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
