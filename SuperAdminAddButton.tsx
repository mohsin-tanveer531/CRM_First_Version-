// import React from "react";
import { Fab, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

export default function SuperAdminAddButton() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6">
      <Tooltip title="Create Super Admin">
        <Fab
          color="primary"
          onClick={() => navigate("/super_admins/create")}
          className="bg-blue-600 hover:bg-blue-700"
          size="medium"
        >
          <AddIcon className="text-white" />
        </Fab>
      </Tooltip>
    </div>
  );
}
