// ── src/routes/ManageUsers.tsx ───────────────────────────────────────────
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import AddIcon    from "@mui/icons-material/Add";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import Sidebar      from "../sa/Sidebar";
import Topbar       from "../sa/TopBar";
import { drawerWidth } from "../sa/constants";
import config         from "../config";

/* ── types ───────────────────────────────────────────────────────────── */
interface UserRow {
  id:         number;
  username:   string;
  ip_address: string;
  role_name:  "ADMIN" | "ANALYST" | "ACCOUNTANT" | "TEAM_LEAD";
  is_active:  boolean;          // ← real flag from backend
}

interface UserForm {
  username:   string;
  password:   string;
  ip_address: string;
  role_name:  UserRow["role_name"];
}

/* ── component ───────────────────────────────────────────────────────── */
export default function ManageUsers() {
  // -------------------------------------------------------------- state
  const [rows,       setRows]       = useState<UserRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [err,        setErr]        = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null); // null = create
  const [form,       setForm]       = useState<UserForm>({
    username:   "",
    password:   "",
    ip_address: "",
    role_name:  "ADMIN",
  });

  const resetForm = () =>
    setForm({ username: "", password: "", ip_address: "", role_name: "ADMIN" });

  // ---------------------------------------------------------- helpers
  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${config.baseURL}/user_roles`);
      if (!res.ok) throw new Error(`GET failed (${res.status})`);
      const data: UserRow[] = await res.json();
      setRows(data);                           // <-- use real is_active flag
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setErr(null);
    const url = editingId
      ? `${config.baseURL}/user_roles/${editingId}`
      : `${config.baseURL}/user_roles`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`${method} failed (${res.status})`);
      await fetchRows();                       // sync table with DB
      setDialogOpen(false);
      setEditingId(null);
      resetForm();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user-role?")) return;
    try {
      const res = await fetch(`${config.baseURL}/user_roles/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`DELETE failed (${res.status})`);
      setRows((r) => r.filter((row) => row.id !== id));
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const handleEdit = (row: UserRow) => {
    setForm({
      username:   row.username,
      password:   "", // blank → keep existing unless user types new one
      ip_address: row.ip_address,
      role_name:  row.role_name,
    });
    setEditingId(row.id);
    setDialogOpen(true);
  };

  // ------------------------------------------------------------ effects
  useEffect(() => {
    fetchRows();                      // initial load
    const t = setInterval(fetchRows, 15_000); // refresh every 15 s
    return () => clearInterval(t);
  }, []);

  // ---------------------------------------------------------- DataGrid
  const cols: GridColDef<UserRow>[] = [
    { field: "username",   headerName: "Name",       flex: 1.2, minWidth: 160 },
    { field: "ip_address", headerName: "IP Address", flex: 1,   minWidth: 150 },
    { field: "role_name",  headerName: "Role",       flex: 0.9, minWidth: 140 },
    {
      field: "is_active",
      headerName: "Status",
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: ({
        value,
      }: GridRenderCellParams<UserRow, boolean>) => (
        <Chip
          size="small"
          label={value ? "active" : "inactive"}
          color={value ? "success" : "error"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.9,
      minWidth: 140,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
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

  // -------------------------------------------------------------- JSX
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Topbar />

      <Box
        component="main"
        sx={{ flexGrow: 1, ml: `${drawerWidth}px`, mt: 8, px: 3, py: 4 }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            mb={3}
          >
            <Typography variant="h4">Users Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setEditingId(null);
                setDialogOpen(true);
              }}
            >
              Add New User
            </Button>
          </Stack>

          {err && (
            <Typography color="error" mb={2}>
              {err}
            </Typography>
          )}

          <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={cols}
              loading={loading}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              sx={{
                bgcolor: "background.paper",
                boxShadow: 2,
                borderRadius: 2,
                "& .MuiDataGrid-columnHeaders": {
                  fontWeight: 600,
                  bgcolor: "grey.100",
                },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* ── Create / Edit dialog ─────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>
          {editingId ? "Edit User-Role" : "Add User-Role"}
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            helperText={editingId ? "Leave blank to keep unchanged" : ""}
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="IP Address"
            value={form.ip_address}
            onChange={(e) =>
              setForm((f) => ({ ...f, ip_address: e.target.value }))
            }
            fullWidth
          />

          <TextField
            select
            label="Role"
            value={form.role_name}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                role_name: e.target.value as UserForm["role_name"],
              }))
            }
            fullWidth
          >
            {["ADMIN", "ANALYST", "ACCOUNTANT", "TEAM_LEAD"].map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>

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
            {editingId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
