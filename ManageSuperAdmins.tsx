// ── src/routes/ManageSuperAdmins.tsx ─────────────────────────────────────
import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from '@mui/x-data-grid';
import AddIcon    from '@mui/icons-material/Add';
import EditIcon   from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import Sidebar        from '../sa/Sidebar';
import Topbar         from '../sa/TopBar';
import { drawerWidth } from '../sa/constants';
import config          from '../config';

/* ── types ────────────────────────────────────────────────────────────── */
interface AdminRow {
  id:         number;
  username:   string;
  ip_address: string;
  is_active:  boolean;                 // ← provided by backend
  status:     'active' | 'inactive';   // derived for the grid
}

interface AdminForm {
  username:   string;
  password:   string;
  ip_address: string;
}

/* ── component ────────────────────────────────────────────────────────── */
export default function ManageSuperAdmins() {
  // const nav = useNavigate();

  // ── state
  const [rows, setRows]       = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [form, setForm] = useState<AdminForm>({
    username: '', password: '', ip_address: '',
  });
  const resetForm = () =>
    setForm({ username: '', password: '', ip_address: '' });

  // ── helpers
  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${config.baseURL}/super_admins`);
      if (!res.ok) throw new Error(`GET failed (${res.status})`);
      const data: Omit<AdminRow, 'status'>[] = await res.json();
      // convert boolean flag → nice label
      setRows(data.map(r => ({
        ...r,
        status: r.is_active ? 'active' : 'inactive',
      })));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setErr(null);
    const url = editingId
      ? `${config.baseURL}/super_admins/${editingId}`
      : `${config.baseURL}/super_admins`;
    const method = editingId ? 'PUT' : 'POST';

    // For PUT – omit blank password so backend keeps existing hash
    const payload =
      method === 'PUT' && form.password.trim() === ''
        ? { username: form.username, ip_address: form.ip_address }
        : form;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`${method} failed (${res.status})`);
      await fetchRows();
      setDialogOpen(false);
      setEditingId(null);
      resetForm();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this super-admin?')) return;
    try {
      const res = await fetch(`${config.baseURL}/super_admins/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`DELETE failed (${res.status})`);
      setRows(r => r.filter(row => row.id !== id));
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const handleEdit = (row: AdminRow) => {
    setForm({
      username:   row.username,
      password:   '',               // leave blank → unchanged
      ip_address: row.ip_address,
    });
    setEditingId(row.id);
    setDialogOpen(true);
  };

  // ── effects
  useEffect(() => { fetchRows(); }, []);

  // ── DataGrid columns
  const cols: GridColDef<AdminRow>[] = [
    { field: 'username',   headerName: 'Username',  flex: 1.1, minWidth: 160 },
    { field: 'ip_address', headerName: 'IP Address',flex: 1,   minWidth: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: false,
      renderCell: ({ value }: GridRenderCellParams<AdminRow,'active'|'inactive'>) =>
        <Chip
          size="small"
          label={value}
          color={value === 'active' ? 'success' : 'error'}
        />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: params => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.id as number)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // ── JSX
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Topbar />

      <Box
        component="main"
        sx={{ flexGrow: 1, ml: `${drawerWidth}px`, mt: 8, px: 3, py: 4 }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
            mb={3}
          >
            <Typography variant="h4">Super-Admin Settings</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => { resetForm(); setEditingId(null); setDialogOpen(true); }}
            >
              Add Super-Admin
            </Button>
          </Stack>

          {err && (
            <Typography color="error" mb={2}>
              {err}
            </Typography>
          )}

          <Box sx={{ height: 520, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={cols}
              loading={loading}
              initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 2,
                borderRadius: 2,
                '& .MuiDataGrid-columnHeaders': {
                  fontWeight: 600,
                  bgcolor: 'grey.100',
                },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* ─── Create / Edit dialog ───────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Super-Admin' : 'Add Super-Admin'}
        </DialogTitle>

        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
        >
          <TextField
            label="Username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            helperText={editingId ? 'Leave blank to keep unchanged' : ''}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            fullWidth
          />
          <TextField
            label="IP Address"
            value={form.ip_address}
            onChange={e => setForm(f => ({ ...f, ip_address: e.target.value }))}
            fullWidth
          />

          {err && <Typography color="error">{err}</Typography>}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              resetForm();
              setEditingId(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}