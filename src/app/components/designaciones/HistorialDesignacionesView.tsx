import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import NavigationBar from "../barra_navegacion/NavBar";
import moment from "moment";
import partidosService from "../../services/PartidoService";
import { Link } from "react-router-dom";

const HistorialDesignacionesView = () => {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPartidosDesignados = async () => {
      try {
        setLoading(true);
        const usuarioId = localStorage.getItem("userId");
        if (!usuarioId) return;

        const partidosDesignados = await partidosService.getPartidosByUserId(usuarioId);

        if (Array.isArray(partidosDesignados)) {
          const partidosPasados = partidosDesignados.filter((partido) => {
            const fechaCompleta = moment(`${partido.fecha} ${partido.hora}`, "YYYY-MM-DD HH:mm:ss");
            return fechaCompleta.isBefore(moment());
          });

          const partidosOrdenados = partidosPasados.sort((a, b) => {
            const fechaA = moment(`${a.fecha} ${a.hora}`, "YYYY-MM-DD HH:mm:ss");
            const fechaB = moment(`${b.fecha} ${b.hora}`, "YYYY-MM-DD HH:mm:ss");
            return fechaA.diff(fechaB);
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

  return (
    <Box
      sx={{
        backgroundColor: '#eafaff',
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
          }}
        >
          <Box
            sx={{
              backgroundColor: "#f9f9f9",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h4" textAlign="center" color="#333" sx={{ fontWeight: 'bold', marginBottom:2 }}>
              Historial
            </Typography>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "50vh",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {partidos.length > 0 ? (
                partidos.map((partido) => (
                  <Grid item xs={12} key={partido.id}>
                    <Link to={`/detallesPartido/${partido.id}`} style={{ textDecoration: "none" }}>
                      <Card
                        sx={{
                          backgroundColor: "#f7fafc",
                          borderRadius: "12px",
                          width: "100%",
                          cursor: "pointer",
                          position: "relative",
                          "&:hover": {
                            boxShadow: 6,
                            transform: "scale(1.05)",
                            transition: "all 0.3s ease",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        <CardContent>
                          <Box sx={{ position: "absolute", top: 8, right: 16, display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="caption" color="text.secondary" fontSize={18}>
                              Haga click para acceder a los detalles del partido
                            </Typography>
                          </Box>

                          <Typography variant="h6" color="primary">
                            {partido.equipoLocal} - {partido.equipoVisitante}
                          </Typography>
                          <Typography variant="body2">
                            {moment(partido.fecha).format("dddd, DD MMMM YYYY")} - {partido.hora.slice(0, 5)}
                          </Typography>

                          <Typography variant="body2">
                            Lugar: {partido.lugar}
                          </Typography>
                          <Typography variant="body2">
                            Categoría: {partido.categoria}
                          </Typography>

                          <Grid container spacing={2} mt={2}>
                            <Grid item xs={12} sm={4}>
                              {partido.arbitro1 && (
                                <Typography variant="body2">
                                  <b>Árbitro 1:</b> {partido.arbitro1}
                                </Typography>
                              )}
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              {partido.arbitro2 && (
                                <Typography variant="body2">
                                  <b>Árbitro 2:</b> {partido.arbitro2}
                                </Typography>
                              )}
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              {partido.anotador && (
                                <Typography variant="body2">
                                  <b>Anotador:</b> {partido.anotador}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Link>
                  </Grid>
                ))
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
                    No tienes partidos arbitrados.
                  </Typography>
                </Box>
              )}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default HistorialDesignacionesView;
