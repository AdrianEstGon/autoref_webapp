import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Grid,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";
import { PhotoCamera } from "@mui/icons-material";
import NavBar from "../barra_navegacion/NavBar";
import userService from "../../services/UserService";
import clubService from "../../services/ClubService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PerfilView = () => {
  const [perfil, setPerfil] = useState({
    fotoPerfil: "https://via.placeholder.com/150",
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    fechaNacimiento: "",
    direccion: "",
    pais: "",
    region: "",
    ciudad: "",
    codigoPostal: "",
    nivel: "",
    clubVinculado: "",
    email: "",
    licencia: "",
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [passwordError, setPasswordError] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [clubNombre, setClubNombre] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const usuarioId = localStorage.getItem("userId");
        if (usuarioId) {
          const datosUsuario = await userService.getUsuarioById(usuarioId);
          setPerfil({
            fotoPerfil: datosUsuario.fotoPerfil || "https://via.placeholder.com/150",
            nombre: datosUsuario.nombre || "",
            primerApellido: datosUsuario.primerApellido || "",
            segundoApellido: datosUsuario.segundoApellido || "",
            fechaNacimiento: datosUsuario.fechaNacimiento
            ? new Date(datosUsuario.fechaNacimiento)
                .toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
                .replace(/\//g, "-") 
            : "",
          
            direccion: datosUsuario.direccion || "",
            pais: datosUsuario.pais || "",
            region: datosUsuario.region || "",
            ciudad: datosUsuario.ciudad || "",
            codigoPostal: datosUsuario.codigoPostal || "",
            nivel: datosUsuario.nivel || "",
            clubVinculado: datosUsuario.clubVinculadoId || "No tiene club vinculado",
            email: datosUsuario.email || "",
            licencia: datosUsuario.licencia || "",
          });

          if (datosUsuario.clubVinculadoId) {
            obtenerClubNombre(datosUsuario.clubVinculadoId);
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    obtenerPerfil();
  }, []);

  const obtenerClubNombre = async (clubId: string) => {
    try {
      const club = await clubService.getClubById(clubId);
      setClubNombre(club.nombre || "Club no encontrado");
    } catch (error) {
      console.error("Error al obtener el nombre del club:", error);
      setClubNombre("Club no encontrado");
    }
  };

  const manejarCambioFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingPhoto(true);
      const fotoURL = URL.createObjectURL(e.target.files[0]);

      try {
        const usuarioId = localStorage.getItem("userId");
        if (usuarioId) {
          await userService.uploadProfilePicture(e.target.files[0]);
          setFotoPreview(fotoURL); 
          localStorage.setItem("fotoPerfil", fotoURL);
          toast.success("Foto de perfil actualizada con éxito");
          window.dispatchEvent(new Event("storage"));
        }
      } catch (error) {
        console.error("Error al subir la foto de perfil:", error);
        toast.error("Error al actualizar la foto de perfil");
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const validarContraseñaSegura = (password: string) => {
    const longitudMinima = /.{8,}/;
    const tieneMayuscula = /[A-Z]/;
    const tieneMinuscula = /[a-z]/;
    const tieneNumero = /\d/;
    const tieneCaracterEspecial = /[!@#$%^&*(),.?":{}|<>]/;

    if (!longitudMinima.test(password)) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    if (!tieneMayuscula.test(password)) {
      return "La contraseña debe contener al menos una letra mayúscula.";
    }
    if (!tieneMinuscula.test(password)) {
      return "La contraseña debe contener al menos una letra minúscula.";
    }
    if (!tieneNumero.test(password)) {
      return "La contraseña debe contener al menos un número.";
    }
    if (!tieneCaracterEspecial.test(password)) {
      return "La contraseña debe contener al menos un carácter especial.";
    }

    return "";
  };

  const handlePasswordChange = async () => {
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      return;
    }

    const errorContraseña = validarContraseñaSegura(newPassword);
    if (errorContraseña) {
      setNewPasswordError(errorContraseña);
      return;
    }

    try {
      const response = await userService.changePassword({
        OldPassword: oldPassword,
        NewPassword: newPassword,
      });

      if (response.status === 200) {
        toast.success("Contraseña actualizada con éxito");
        setOpenDialog(false);
      } else {
        toast.error("Error al cambiar la contraseña");
      }
    } catch (error) {
      toast.error("Error al cambiar la contraseña");

      if (error instanceof Error && error.message.includes("La contraseña actual no es correcta")) {
        setOldPasswordError("La contraseña actual es incorrecta");
      } else {
        toast.error("Error al cambiar la contraseña");
      }
    } finally {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#eafaff',
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        paddingBottom: "80px", 
      }}
    >
      <NavBar />
      <Container
  maxWidth="lg" 
  sx={{
    minHeight: "calc(100vh - 64px)", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    py: 5,
    overflow: "hidden", 
  }}
>
  <Card sx={{ borderRadius: 3, boxShadow: 6, backgroundColor: "#f9f9f9", width: "100%" }}>
    <CardHeader
      title={<Typography variant="h4" fontWeight={600}>Perfil</Typography>}
      sx={{ textAlign: "center", pb: 0 }}
    />
    <CardContent>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
          <Avatar
            src={fotoPreview || perfil.fotoPerfil} 
            sx={{ width: 120, height: 120, boxShadow: 3 }}
          />
          <Tooltip title="Modificar foto de perfil">
            <IconButton color="primary" component="label" sx={{ mt: 2 }} disabled={isUploadingPhoto}>
              <input hidden accept="image/*" type="file" onChange={manejarCambioFoto} />
              {isUploadingPhoto ? <CircularProgress size={24} /> : <PhotoCamera fontSize="large" />}
            </IconButton>
          </Tooltip>
        </Grid>
        
        {/* Los campos del perfil */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Nombre"
            value={perfil.nombre}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Primer Apellido"
            value={perfil.primerApellido}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Segundo Apellido"
            value={perfil.segundoApellido}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Fecha de Nacimiento"
            value={perfil.fechaNacimiento}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Dirección"
            value={perfil.direccion}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="País"
            value={perfil.pais}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Región"
            value={perfil.region}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Ciudad"
            value={perfil.ciudad}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Código Postal"
            value={perfil.codigoPostal}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nivel"
            value={perfil.nivel}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Club Vinculado"
            value={clubNombre}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Correo Electrónico"
            value={perfil.email}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Licencia"
            value={perfil.licencia}
            InputProps={{ readOnly: true }}
            variant="filled"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              // Limpia todos los campos y errores antes de abrir el diálogo
              setOldPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setOldPasswordError("");
              setNewPasswordError("");
              setConfirmPasswordError("");
              setPasswordError("");
              setOpenDialog(true);
            }}
            sx={{ mt: 3, width: "100%" }}
          >
            Modificar Contraseña
          </Button>

        </Grid>
      </Grid>
    </CardContent>
  </Card>
</Container>

      {/* Diálogo de cambiar contraseña */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Modificar Contraseña</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Contraseña Actual"
            type={showOldPassword ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            error={Boolean(oldPasswordError)}
            helperText={oldPasswordError}
            variant="outlined"
            sx={{ mb: 2, mt: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Nueva Contraseña"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={Boolean(newPasswordError)}
            helperText={newPasswordError}
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirmar Nueva Contraseña"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={Boolean(confirmPasswordError)}
            helperText={confirmPasswordError}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="error">
            Cancelar
          </Button>
          <Button onClick={handlePasswordChange} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerfilView;
