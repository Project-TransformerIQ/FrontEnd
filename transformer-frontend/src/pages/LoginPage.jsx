// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { ElectricalServices } from "@mui/icons-material";
import { useUser } from "../contexts/UserContext"; // ⬅️ important

export default function LoginPage() {
  const { login } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔐 backend checks password
      const user = await login(name.trim(), password);

      // 🎯 redirect based on admin flag from backend
      if (user.admin) {
        navigate("/admin/users", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (e) {
      const msg = e?.response?.data?.error || "Invalid credentials";
      setError(msg);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Card sx={{ width: "100%", borderRadius: 3, boxShadow: "0 12px 30px rgba(0,0,0,0.15)" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              <ElectricalServices sx={{ fontSize: 40, color: "primary.main" }} />
              <Typography variant="h5" fontWeight={700}>
                Transformer Maintenance Portal
              </Typography>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  inputProps={{ autoComplete: "current-password" }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Log In
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Default admin: <b>admin / admin123</b>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
