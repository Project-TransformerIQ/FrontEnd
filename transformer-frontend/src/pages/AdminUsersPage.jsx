// src/pages/AdminUsersPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
import api from "../services/api";

const OCCUPATIONS = [
  "INSPECTION_ENGINEER",
  "MAINTENANCE_ENGINEER",
  "TECHNICIAN",
];

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [occupation, setOccupation] = useState("INSPECTION_ENGINEER");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser?.admin) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">Only admin can access this page.</Alert>
      </Container>
    );
  }

  const handleCreate = async () => {
    setError(null);
    setMessage(null);

    if (!name.trim() || !password) {
      setError("Name and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/admin/users", {
        name: name.trim(),
        password,
        occupation,
      });
      setMessage(`User "${name.trim()}" created successfully.`);
      setName("");
      setPassword("");
      setOccupation("INSPECTION_ENGINEER");
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        (e?.response?.status === 403
          ? "Only admin can create users (403 from backend)."
          : "Failed to create user");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    // Important: clear currentUser so /login shows the login form
    logout();
    navigate("/login");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Admin · Create User
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Logged in as: <strong>{currentUser.name}</strong> (
            {currentUser.occupation})
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              fullWidth
            >
              {OCCUPATIONS.map((occ) => (
                <MenuItem key={occ} value={occ}>
                  {occ.replace("_", " ")}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create User"}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={handleBackToLogin}
              >
                Back to Login
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
