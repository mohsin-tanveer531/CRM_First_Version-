import { useEffect, useState } from 'react';
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import TaskIcon from '@mui/icons-material/Task';
import BuildIcon from '@mui/icons-material/Build';
import { useNavigate } from 'react-router-dom';
import config from '../config';

import Sidebar from '../sa/Sidebar';
import Topbar from '../sa/TopBar';

type StatData = {
  total_users: number;
  total_processors: number;
  open_tasks: number;
  admin_tools: number;
};

const DEFAULT_STATS: StatData = {
  total_users: 0, // Initializing with 0, it will be updated from API
  total_processors: 3,
  open_tasks: 25,
  admin_tools: 8,
};

export default function Dashboard({ stats = DEFAULT_STATS }: { stats?: StatData }) {
  const nav = useNavigate();
  const [userCount, setUserCount] = useState<number | null>(null);

  // Fetch user count from backend when the component is mounted
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await fetch(`${config.baseURL}/user_roles/user_count`);
        if (!res.ok) throw new Error(`Failed to fetch user count`);
        const data = await res.json();
        setUserCount(data.user_count);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    fetchUserCount();
  }, []);

  /* one-off helper to render the cards */
  const StatCard = ({
    count, label, icon, to,
  }: {
    count: number;
    label: string;
    icon: React.ReactNode;
    to: string;
  }) => (
    <Card sx={{ minWidth: 200 }}>
      <CardActionArea onClick={() => nav(to)}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 1, fontSize: 40 }}>{icon}</Box>
          <Typography variant="h4">{count}</Typography>
          <Typography>{label}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', background: '#1e1e1e', color: '#fff' }}>
      <Sidebar />
      <Topbar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',   /* AppBar height */
          ml: '240px',  /* Drawer width */
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography variant="h4">Super Admin Dashboard</Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          }}
        >
          <StatCard
            count={userCount !== null ? userCount : 0} // Dynamically showing user count
            label="Users"
            icon={<PeopleIcon color="primary" fontSize="large" />}
            to="/manage-users"
          />
          <StatCard
            count={stats.total_processors}
            label="Processors"
            icon={<SettingsIcon color="secondary" fontSize="large" />}
            to="/processors"
          />
          <StatCard
            count={stats.open_tasks}
            label="Tasks"
            icon={<TaskIcon color="success" fontSize="large" />}
            to="/tasks"
          />
          <StatCard
            count={stats.admin_tools}
            label="Admin Tools"
            icon={<BuildIcon color="warning" fontSize="large" />}
            to="/admin-tools"
          />
        </Box>
      </Box>
    </Box>
  );
}
