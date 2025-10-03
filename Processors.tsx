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
import PauseIcon  from "@mui/icons-material/PauseCircleFilled";
import PlayIcon   from "@mui/icons-material/PlayArrow";

import Sidebar      from "../sa/Sidebar";
import Topbar       from "../sa/TopBar";
import { drawerWidth } from "../sa/constants";
import config         from "../config";
import {socket} from "../sa/socket";          // small helper you created

/* ── types ─────────────────────────────────────────────────────────── */
interface ProcessorRow {
  id:        string;
  name:      string;
  kind:      "STRIPE" | "NMI" | "ADYEN";
  verified:  boolean;
  status:    "ACTIVE" | "ON_HOLD";
  created_at:string;
}

interface ProcessorForm {
  name:       string;
  kind:       ProcessorRow["kind"];
  secret_key?:string;         // Stripe
  api_key?:   string;         // NMI
  merchant_id?:string;        // NMI
}

/* ── component ─────────────────────────────────────────────────────── */
export default function ManageProcessors() {
  // -------------------------------------------------------------- state
  const [rows,       setRows]       = useState<ProcessorRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [err,        setErr]        = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formStep,   setFormStep]   = useState(0);
  const [form,       setForm]       = useState<ProcessorForm>({
    name: "",
    kind: "STRIPE",
  });

  // ---------------------------------------------------------- helpers
  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${config.baseURL}/processors`);
      if (!res.ok) throw new Error(`GET failed (${res.status})`);
      const data: ProcessorRow[] = await res.json();
      setRows(data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (row: ProcessorRow) => {
    const new_status = row.status === "ACTIVE" ? "ON_HOLD" : "ACTIVE";
    try {
      await fetch(
        `${config.baseURL}/processors/${row.id}/status?new_status=${new_status}`,
        { method: "PATCH" },
      );
      setRows(r =>
        r.map(x => (x.id === row.id ? { ...x, status: new_status } : x)),
      );
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const handleSave = async () => {
    try {
      const { name, kind, ...credentials } = form;
      await fetch(`${config.baseURL}/processors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, kind, credentials }),
      });
      setDialogOpen(false);
      setFormStep(0);
      setForm({ name: "", kind: "STRIPE" });
      fetchRows();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  // ------------------------------------------------------------ effects
  useEffect(() => {
    fetchRows();
    const t = setInterval(fetchRows, 15_000);
    return () => clearInterval(t);
  }, []);

  // live updates from Redis→Socket bridge
// live updates from Redis → Socket bridge
useEffect(() => {
  const handler = (p: Partial<ProcessorRow> & { id: string }) =>
    setRows(r => r.map(x => (x.id === p.id ? { ...x, ...p } : x)));

  socket.on("processorUpdate", handler);

  // cleanup
  return () => {
    socket.off("processorUpdate", handler);   // <-- now returns void
  };
}, []);



  // ---------------------------------------------------------- DataGrid
  const cols: GridColDef<ProcessorRow>[] = [
    { field: "name", headerName: "Name", flex: 1.2, minWidth: 160 },
    { field: "kind", headerName: "Type", flex: 0.8, minWidth: 120 },
    {
      field: "verified",
      headerName: "Verified",
      flex: 0.8,
      minWidth: 120,
      renderCell: ({ value }: GridRenderCellParams<ProcessorRow>) => (
        <Chip
          size="small"
          label={value ? "yes" : "no"}
          color={value ? "success" : "warning"}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.9,
      minWidth: 120,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value}
          color={value === "ACTIVE" ? "primary" : "default"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      minWidth: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <IconButton
          size="small"
          color={row.status === "ACTIVE" ? "warning" : "success"}
          onClick={() => handleToggle(row)}
        >
          {row.status === "ACTIVE" ? (
            <PauseIcon fontSize="small" />
          ) : (
            <PlayIcon fontSize="small" />
          )}
        </IconButton>
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
            <Typography variant="h4">Processors Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Add Processor
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

      {/* ── Add Processor wizard ─────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>Add Processor</DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {formStep === 0 && (
            <>
              <TextField
                label="Display Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                fullWidth
              />
              <TextField
                select
                label="Gateway Type"
                value={form.kind}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    kind: e.target.value as ProcessorForm["kind"],
                  }))
                }
                fullWidth
              >
                {["STRIPE", "NMI", "ADYEN"].map((k) => (
                  <MenuItem key={k} value={k}>
                    {k}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}

          {formStep === 1 && form.kind === "STRIPE" && (
            <TextField
              label="Secret Key"
              value={form.secret_key || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, secret_key: e.target.value }))
              }
              fullWidth
            />
          )}

          {formStep === 1 && form.kind === "NMI" && (
            <>
              <TextField
                label="API Key"
                value={form.api_key || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, api_key: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Merchant ID"
                value={form.merchant_id || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, merchant_id: e.target.value }))
                }
                fullWidth
              />
            </>
          )}

          {formStep === 2 && (
            <Box p={1}>
              <pre>{JSON.stringify(form, null, 2)}</pre>
            </Box>
          )}

          {err && <Typography color="error">{err}</Typography>}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {formStep > 0 && (
            <Button onClick={() => setFormStep((s) => s - 1)}>Back</Button>
          )}
          {formStep < 2 ? (
            <Button variant="contained" onClick={() => setFormStep((s) => s + 1)}>
              Next
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
