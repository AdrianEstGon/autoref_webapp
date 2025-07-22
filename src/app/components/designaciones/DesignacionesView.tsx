import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import NavigationBar from "../barra_navegacion/NavBar";
import moment from "moment";
import partidosService from "../../services/PartidoService";
import { Link } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const DesignacionesView = () => {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPartidoId, setSelectedPartidoId] = useState<string | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<number | null>(null);
  const [disabledButtons, setDisabledButtons] = useState<Record<string, boolean>>({});
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // sm = 600px o menos

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUsuarioId(id);
  }, []);

  useEffect(() => {
    const cargarPartidosDesignados = async () => {
      setLoading(true);
      try {
        const usuarioId = localStorage.getItem("userId");
        if (!usuarioId) return;

        const partidosDesignados = await partidosService.getPartidosByUserId(usuarioId);

        if (Array.isArray(partidosDesignados)) {
          const partidosFuturos = partidosDesignados.filter((partido) => {
            const fechaCompleta = moment(`${partido.fecha} ${partido.hora}`, "YYYY-MM-DD HH:mm:ss");
            return fechaCompleta.isAfter(moment());
          });

          const partidosOrdenados = partidosFuturos.sort((a, b) => {
            const fechaA = moment(`${a.fecha} ${a.hora}`, "YYYY-MM-DD HH:mm:ss");
            const fechaB = moment(`${b.fecha} ${b.hora}`, "YYYY-MM-DD HH:mm:ss");
            return fechaA.valueOf() - fechaB.valueOf();
          });

          setPartidos(partidosOrdenados);
        } else {
          setPartidos([]);
        }
      } catch (error) {
        console.error("Error al cargar los partidos designados:", error);
        setPartidos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarPartidosDesignados();
  }, []);


  const handleConfirm = async () => {
    if (!selectedPartidoId || selectedEstado === null || !usuarioId) return;

    try {
      const partido = partidos.find((p) => p.id === selectedPartidoId);
      if (!partido) return;

      const updatedPartido = { ...partido };
      if (partido.arbitro1Id === usuarioId) {
        updatedPartido.estadoArbitro1 = selectedEstado;
      } else if (partido.arbitro2Id === usuarioId) {
        updatedPartido.estadoArbitro2 = selectedEstado;
      } else if (partido.anotadorId === usuarioId) {
        updatedPartido.estadoAnotador = selectedEstado;
      } else {
        console.error("El usuario no tiene un rol en este partido.");
        return;
      }

      await partidosService.actualizarPartido(updatedPartido);

      setPartidos((prevPartidos) =>
        prevPartidos.map((p) => (p.id === selectedPartidoId ? updatedPartido : p))
      );

      setDisabledButtons((prev) => ({ ...prev, [selectedPartidoId]: true }));
    } catch (error) {
      console.error("Error al actualizar la designación:", error);
    } finally {
      setDialogOpen(false);
      setSelectedPartidoId(null);
      setSelectedEstado(null);
    }
  };

  const handleOpenDialog = (partidoId: string, estado: number) => {
    setSelectedPartidoId(partidoId);
    setSelectedEstado(estado);
    setDialogOpen(true);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedPartidoId(null);
    setSelectedEstado(null);
  };
return (
    <Box sx={{ backgroundColor: "#eafaff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavigationBar />
      <Container sx={{ marginTop: 4 }}>
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            marginBottom: 3,
            minHeight: "80vh",
            backgroundColor: "#f9f9f9",
            borderRadius: "12px",
            position: "relative",
          }}
        >
          <Typography
            variant="h4"
            textAlign="center"
            color="#333"
            sx={{ fontWeight: "bold", marginBottom: 2 }}
          >
            Mis Designaciones
          </Typography>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "60vh",
              }}
            >
              <CircularProgress />
            </Box>
          ) : partidos.length > 0 ? (
            <Grid container spacing={2}>
              {partidos.map((partido) => (
                <Grid item xs={12} key={partido.id}>
                  <Box sx={{ display: "flex", height: "100%" }}>
                    <Paper elevation={2} sx={{ display: "flex", width: "100%" }}>
                      <Box sx={{ flex: 9, position: "relative" }}>
                        <Link to={`/detallesPartido/${partido.id}`} style={{ textDecoration: "none" }}>
                          <Card
                            sx={{
                              position: "relative",
                              backgroundColor: "#f7fafc",
                              borderRadius: "12px 0 0 12px",
                              height: "100%",
                              transition: "all 0.3s ease",
                              "&:hover": { boxShadow: 6, transform: "scale(1.02)" },
                            }}
                          >
                            <CardContent>
                              {!isSmallScreen && (
                                <Box sx={{ position: "absolute", top: 8, right: 16 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontSize={18}
                                  >
                                    Haga clic para acceder a los detalles del partido
                                  </Typography>
                                </Box>
                              )}
                              {isSmallScreen && (
                                <Box sx={{ position: "absolute", top: 8, right: 16, maxWidth: 120 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontSize={14}
                                    noWrap
                                  >
                                    Click para detalles
                                  </Typography>
                                </Box>
                              )}

                              <Typography variant="h6" color="primary">
                                {partido.equipoLocal} - {partido.equipoVisitante}
                              </Typography>
                              <Typography variant="body2">
                                {moment(`${partido.fecha} ${partido.hora}`, "YYYY-MM-DD HH:mm").format(
                                  "dddd, DD MMMM YYYY - HH:mm"
                                )}
                              </Typography>
                              <Typography variant="body2">Lugar: {partido.lugar}</Typography>
                              <Typography variant="body2">Categoría: {partido.categoria}</Typography>
                              <Grid container spacing={2} mt={2}>
                                {partido.arbitro1 && (
                                  <Grid item xs={12} sm={4}>
                                    <Typography>
                                      <b>Árbitro 1:</b> {partido.arbitro1}
                                    </Typography>
                                  </Grid>
                                )}
                                {partido.arbitro2 && (
                                  <Grid item xs={12} sm={4}>
                                    <Typography>
                                      <b>Árbitro 2:</b> {partido.arbitro2}
                                    </Typography>
                                  </Grid>
                                )}
                                {partido.anotador && (
                                  <Grid item xs={12} sm={4}>
                                    <Typography>
                                      <b>Anotador:</b> {partido.anotador}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </CardContent>
                          </Card>
                        </Link>
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          backgroundColor: "#f0f4f8",
                          borderLeft: "2px solid #d0d0d0",
                          borderRadius: "0 12px 12px 0",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 1,
                          paddingY: 1,
                        }}
                      >
                        {(() => {
                          if (!usuarioId) return null;

                          let estadoActual = null;

                          if (partido.arbitro1Id === usuarioId) {
                            estadoActual = partido.estadoArbitro1;
                          } else if (partido.arbitro2Id === usuarioId) {
                            estadoActual = partido.estadoArbitro2;
                          } else if (partido.anotadorId === usuarioId) {
                            estadoActual = partido.estadoAnotador;
                          }

                          if (estadoActual === 0) {
                            return (
                              <>
                                <Tooltip title="Aceptar designación" arrow placement="right">
                                  <span>
                                    <IconButton
                                      aria-label="Aceptar designación"
                                      onClick={() => handleOpenDialog(partido.id, 1)}
                                      sx={{
                                        backgroundColor: "#4CAF50",
                                        color: "white",
                                        "&:hover": { backgroundColor: "#45a049" },
                                      }}
                                    >
                                      <CheckIcon />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Rechazar designación" arrow placement="right">
                                  <span>
                                    <IconButton
                                      aria-label="Rechazar designación"
                                      onClick={() => handleOpenDialog(partido.id, 2)}
                                      sx={{
                                        backgroundColor: "#F44336",
                                        color: "white",
                                        "&:hover": { backgroundColor: "#e53935" },
                                      }}
                                    >
                                      <CloseIcon />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </>
                            );
                          } else {
                            return (
                              <Box
                                sx={{
                                  textAlign: "center",
                                  color: estadoActual === 1 ? "#4CAF50" : "#F44336",
                                  fontWeight: "bold",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: "8px",
                                  flexDirection: "column",
                                }}
                              >
                                {estadoActual === 1 ? (
                                  <>
                                    <CheckIcon sx={{ color: "#4CAF50", fontSize: 32 }} />
                                    <Typography variant="body2">Aceptado</Typography>
                                  </>
                                ) : (
                                  <>
                                    <CloseIcon sx={{ color: "#F44336", fontSize: 32 }} />
                                    <Typography variant="body2">Rechazado</Typography>
                                  </>
                                )}
                              </Box>
                            );
                          }
                        })()}
                      </Box>
                    </Paper>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                marginTop: "10%",
                padding: 4,
              }}
            >
              <img
                src="/notFoundIcon.png"
                alt="No designaciones"
                style={{ maxWidth: "200px", marginBottom: "16px", opacity: 0.7 }}
              />
              <Typography variant="h6" color="textSecondary">
                No tienes partidos designados.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>

      <Dialog open={dialogOpen} onClose={handleCancel}>
        <DialogTitle>Confirmar acción</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas {selectedEstado === 1 ? "aceptar" : "rechazar"} esta designación?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="error">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DesignacionesView;