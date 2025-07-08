import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import NavigationBar from "../barra_navegacion/NavBar";
import partidosService from "../../services/PartidoService";
import moment from "moment";
import { Person, Event } from "@mui/icons-material";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";

const DetallesPartidoView = () => {
  const { id } = useParams();
  const [partido, setPartido] = useState<{
    numeroPartido: string;
    equipoLocal: string;
    equipoVisitante: string;
    fecha: string;
    hora: string;
    lugar: { nombre: string; latitud: number; longitud: number } | null;
    categoria: string;
    jornada: string;
    arbitro1?: { nombre: string; primerApellido: string; segundoApellido: string } | null;
    arbitro1Licencia: string;
    arbitro2?: { nombre: string; primerApellido: string; segundoApellido: string } | null;
    arbitro2Licencia: string;
    anotador?: { nombre: string; primerApellido: string; segundoApellido: string } | null;
    anotadorLicencia: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const center = partido?.lugar
    ? {
        lat: partido.lugar.latitud,
        lng: partido.lugar.longitud,
      }
    : { lat: 0, lng: 0 };

  useEffect(() => {
    const cargarDetallesPartido = async () => {
      try {
        if (!id) {
          throw new Error("ID del partido no proporcionado.");
        }
        const partidoData = await partidosService.getPartidoById(id);
        setPartido({
          ...partidoData,
        });
      } catch (error) {
        console.error("Error al cargar los detalles del partido:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDetallesPartido();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!partido) {
    return <Typography variant="h6" textAlign="center">No se encontró el partido.</Typography>;
  }

  return (
    <Box
      sx={{
        backgroundColor: '#eafaff',
        height: "100% ",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavigationBar />
      <Container sx={{ marginTop: 4 }}>
        <Paper elevation={3} sx={{ padding: 4, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
          <Typography variant="h4" textAlign="center" color="#333" sx={{ fontWeight: 'bold', marginBottom:2 }}>
            Detalles del Partido: {partido.equipoLocal} - {partido.equipoVisitante}
          </Typography>
          
          <Card sx={{ marginBottom: 2, boxShadow: 3, backgroundColor: '#F0F4F8' }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                <Event sx={{ verticalAlign: "middle" }} /> Información del Partido
              </Typography>
              <Typography><strong>Número de partido:</strong> {partido.numeroPartido}</Typography>
              <Typography><strong>Equipo Local:</strong> {partido.equipoLocal}</Typography>
              <Typography><strong>Equipo Visitante:</strong> {partido.equipoVisitante}</Typography>
              <Typography><strong>Polideportivo:</strong> {partido.lugar ? partido.lugar.nombre : "No especificado"} </Typography>
              <Typography><strong>Categoría:</strong> {partido.categoria}</Typography>
              <Typography><strong>Jornada:</strong> {partido.jornada}</Typography>
              <Typography><strong>Fecha:</strong> {moment(partido.fecha).format("DD/MM/YYYY")}</Typography>
              <Typography><strong>Hora:</strong> {moment(partido.hora, "HH:mm").format("HH:mm")} </Typography>
            </CardContent>
          </Card>

          <Grid container spacing={2} mt={2}>
          {/* Árbitro 1 */}
          {partido.arbitro1 && (
            <Grid item xs={12} sm={12}>
              <Card sx={{ boxShadow: 3, borderRadius: 2, backgroundColor: '#F0F4F8' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    <Person sx={{ verticalAlign: "middle" }} /> Árbitro 1
                  </Typography>
                  <Typography><strong>Nombre:</strong> {partido.arbitro1 ? `${partido.arbitro1}` : "-"}</Typography>
                  <Typography><strong>Licencia:</strong> {partido.arbitro1Licencia || "N/A"} </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Árbitro 2 */}
          {partido.arbitro2 && (
            <Grid item xs={12} sm={12}>
              <Card sx={{ boxShadow: 3, borderRadius: 2, backgroundColor: '#F0F4F8' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    <Person sx={{ verticalAlign: "middle" }} /> Árbitro 2
                  </Typography>
                  <Typography><strong>Nombre:</strong> {partido.arbitro2 ? `${partido.arbitro2}` : "-"}</Typography>
                  <Typography><strong>Licencia:</strong> {partido.arbitro2Licencia || "N/A"} </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Anotador */}
          {partido.anotador && (
            <Grid item xs={12} sm={12}>
              <Card sx={{ boxShadow: 3, borderRadius: 2, backgroundColor: '#F0F4F8' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    <Person sx={{ verticalAlign: "middle" }} /> Anotador
                  </Typography>
                  <Typography><strong>Nombre:</strong> {partido.anotador ? `${partido.anotador}` : "-"}</Typography>
                  <Typography><strong>Licencia:</strong> {partido.anotadorLicencia || "N/A"} </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

          {partido.lugar && (
            <Box mt={3}>
              <Typography variant="h6" color="primary" textAlign="center" marginBottom={2}>
                ¿Cómo llegar al polideportivo?
              </Typography>
              <GoogleMap
                mapContainerStyle={{ height: "400px", width: "100%" }}
                center={center}
                zoom={15}
              >
                <Marker position={center} />
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </Box>
          )}

          <Box textAlign="right" mt={3}>
            <Button
              variant="contained"
              color="primary"
              href="/#/misDesignaciones"
              sx={{
                padding: "10px 30px",
                fontSize: "16px",
                boxShadow: 3,
                "&:hover": { backgroundColor: "#1565C0", boxShadow: 6 },
              }}
            >
              Volver
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DetallesPartidoView;
