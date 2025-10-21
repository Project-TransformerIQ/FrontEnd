// src/pages/LoginPage.jsx
import { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";

const users = [
  "John Smith",
  "Sarah Johnson",
  "Michael Chen",
  "Emily Davis",
  "David Wilson",
];

function LoginPage({ onLogin }) {
  const [selectedUser, setSelectedUser] = useState("");

  const handleLogin = () => {
    if (selectedUser) {
      onLogin(selectedUser);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
          }}
        >
          <LoginIcon
            sx={{
              fontSize: 60,
              color: "primary.main",
              mb: 2,
            }}
          />
          <Typography
            component="h1"
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Welcome
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Please select your name to continue
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="user-select-label">Select User</InputLabel>
            <Select
              labelId="user-select-label"
              id="user-select"
              value={selectedUser}
              label="Select User"
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            disabled={!selectedUser}
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
