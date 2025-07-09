import React, { useState, useEffect, JSX, useImperativeHandle, forwardRef } from "react";
import {
  Container, Typography, Paper, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, IconButton, Grid, useMediaQuery, useTheme,
  Autocomplete, Backdrop, CircularProgress
} from "@mui/material";
import NavigationBar from "../barra_navegacion/NavBar";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import disponibilidadService from "../../services/DisponibilidadService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./DisponibilidadView.css";

moment.locale("es");
const localizer = momentLocalizer(moment);

type CustomEvent = {
  title: string;
  start: Date;
  end: Date;
  resource: string;
  availability: number;
  color?: string;
  icon?: JSX.Element;
};

const DisponibilidadView = forwardRef((_props, ref) => {
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<{ [key: string]: number | string }>({});
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const loadAvailabilityForDate = async (date: Date) => {
    const usuarioId = localStorage.getItem("userId");
    if (!usuarioId) {
      toast.error("Error: Usuario no identificado");
      setLoading(false);
      return;
    }

    const formattedDate = moment(date).format("YYYY-MM-DD");

    try {
      const disponibilidad = await disponibilidadService.getDisponibilidadByUserAndDate(usuarioId, formattedDate);

      if (disponibilidad) {
        setAvailability({
          Franja1: disponibilidad.franja1 || '',
          Franja2: disponibilidad.franja2 || '',
          Franja3: disponibilidad.franja3 || '',
          Franja4: disponibilidad.franja4 || '',
          comments: disponibilidad.comentarios || ''
        });
      } else {
        setAvailability({
          Franja1: '',
          Franja2: '',
          Franja3: '',
          Franja4: '',
          comments: ''
        });
      }
    } catch (error) {
      console.error("Error al cargar disponibilidad:", error);
      toast.error("Ocurrió un error al cargar la disponibilidad");
    }
  };

const loadAvailabilityForMonth = async (month: Date) => {
  setLoading(true);
  const usuarioId = localStorage.getItem("userId");
  if (!usuarioId) {
    toast.error("Error: Usuario no identificado");
    setLoading(false);
    return;
  }

  const startOfMonth = moment(month).startOf("month");
  const endOfMonth = moment(month).endOf("month");
  const days: moment.Moment[] = [];

  for (let day = startOfMonth.clone(); day.isSameOrBefore(endOfMonth, "day"); day.add(1, "days")) {
    days.push(day.clone());
  }

  try {
    const results = await Promise.all(
      days.map(async (day) => {
        const formattedDate = day.format("YYYY-MM-DD");
        const disponibilidad = await disponibilidadService.getDisponibilidadByUserAndDate(usuarioId, formattedDate);
        return { day: day.toDate(), disponibilidad };
      })
    );

    const events: CustomEvent[] = [];

    results.forEach(({ day, disponibilidad }) => {
      const dayEvents: CustomEvent[] = ["Franja1", "Franja2", "Franja3", "Franja4"].map((franja, index) => {
        const availability = disponibilidad?.[franja.toLowerCase()] || 0;
        if (availability === 0) return null;

        const event: CustomEvent = {
          title: ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00", "18:00 - 22:00"][index],
          start: moment(day).hour(9 + index * 3).minute(0).toDate(),
          end: moment(day).hour(12 + index * 3).minute(0).toDate(),
          resource: franja,
          availability,
        };

        if (availability === 1) {
          event.color = "blue";
          event.icon = <DirectionsCarIcon style={{ color: 'blue' }} />;
        } else if (availability === 2) {
          event.color = "green";
          event.icon = <DirectionsWalkIcon style={{ color: 'green' }} />;
        } else if (availability === 3) {
          event.color = "red";
          event.icon = <DoNotDisturbIcon style={{ color: 'red' }} />;
        }

        return event;
      }).filter((e): e is CustomEvent => e !== null);

      events.push(...dayEvents);
    });

    setEvents(events);
  } catch (error) {
    console.error("Error al cargar disponibilidad:", error);
    toast.error("Ocurrió un error al cargar la disponibilidad");
  }

  setLoading(false);
};

  const handleSave = async () => {
  setSaving(true);  
  if (!selectedDate) return;

  

  const usuarioId = localStorage.getItem("userId");
  if (!usuarioId) {
    toast.error("Error: Usuario no identificado");
    setSaving(false);
    return;
  }

  const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

  const disponibilidadData = {
    usuarioId,
    fecha: formattedDate,
    franja1: availability.Franja1 || 0,
    franja2: availability.Franja2 || 0,
    franja3: availability.Franja3 || 0,
    franja4: availability.Franja4 || 0,
    comentarios: availability.comments || "",
  };

  try {
    const disponibilidadExistente = await disponibilidadService.getDisponibilidadByUserAndDate(usuarioId, formattedDate);

    if (disponibilidadExistente && disponibilidadExistente.disponibilidad !== null) {
      await disponibilidadService.actualizarDisponibilidad({
        ...disponibilidadExistente,
        ...disponibilidadData,
      });
    } else {
      await disponibilidadService.crearDisponibilidad(disponibilidadData);
    }

    setAvailability(prevAvailability => ({
      ...prevAvailability,
      Franja1: disponibilidadData.franja1,
      Franja2: disponibilidadData.franja2,
      Franja3: disponibilidadData.franja3,
      Franja4: disponibilidadData.franja4,
      comments: disponibilidadData.comentarios
    }));

    await loadAvailabilityForMonth(currentDate);

    setOpenDialog(false);  // Cerrar diálogo primero

    toast.success(
      disponibilidadExistente && disponibilidadExistente.disponibilidad !== null
        ? "Disponibilidad actualizada con éxito"
        : "Disponibilidad creada con éxito"
    );
  } catch (error) {
    console.error("Error al guardar disponibilidad:", error);
    toast.error("Ocurrió un error al guardar la disponibilidad");
  } finally {
    setSaving(false); 
  }
};

  const eventStyleGetter = (event: CustomEvent) => {
    let backgroundColor = 'white';
    if (event.availability === 1) {
      backgroundColor = '#c6eefe';
    } else if (event.availability === 2) {
      backgroundColor = '#d8ffcd';
    } else if (event.availability === 3) {
      backgroundColor = '#ffc8c1';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        color: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '40px',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        padding: '5px',
        overflow: 'hidden',
      },
    };
  };

  const dayPropGetter = (date: Date) => {
    const isWithin7Days = isDateWithin7Days(date);

    return {
      style: {
        height: isMobile ? '250px' : '300px',
        minHeight: isMobile ? '250px' : '300px',
        overflow: 'hidden',
        backgroundColor: isWithin7Days ? '#f0f0f0' : 'white',
        pointerEvents: (isWithin7Days ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
        opacity: isWithin7Days ? 0.5 : 1,
      },
    };
  };

  const renderEventContent = ({ event }: { event: CustomEvent }) => {
    const testId = `event-${moment(event.start).format('YYYYMMDD')}-${event.resource}`;
    return (
      <div data-testid={testId} style={{ display: "flex", alignItems: "center" }}>
        {event.icon && <div style={{ marginRight: "4px" }}>{event.icon}</div>}
        <span>{event.title}</span>
      </div>
    );
  };

  const renderLegend = () => (
    <Box sx={{ mt: 2, textAlign: 'center' }}>
      <Grid container spacing={2} justifyContent="center" sx={{ mt: 1 }}>
        <Grid item>
          <Box display="flex" alignItems="center">
            <IconButton color="primary"><DirectionsCarIcon /></IconButton>
            <Typography variant="body2" color="#333">Disponible con transporte</Typography>
          </Box>
        </Grid>
        <Grid item>
          <Box display="flex" alignItems="center">
            <IconButton color="success"><DirectionsWalkIcon /></IconButton>
            <Typography variant="body2" color="#333">Disponible sin transporte</Typography>
          </Box>
        </Grid>
        <Grid item>
          <Box display="flex" alignItems="center">
            <IconButton color="error"><DoNotDisturbIcon /></IconButton>
            <Typography variant="body2" color="#333">No disponible</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const isDateWithin7Days = (date: Date) => {
    const today = moment().startOf("day");
    const selected = moment(date).startOf("day");
    return selected.diff(today, "days") < 7;
  };

  const handleSelectSlot = async (slotInfo: { start: Date }) => {
    if (isDateWithin7Days(slotInfo.start)) {
      toast.warning("Solo puedes modificar tu disponibilidad con al menos 7 días de antelación");
      return;
    }
    setSelectedDate(slotInfo.start);
    await loadAvailabilityForDate(slotInfo.start);
    setOpenDialog(true);
  };

  const handleSelectEvent = async (event: any) => {
    if (isDateWithin7Days(event.start)) {
      toast.warning("Solo puedes modificar tu disponibilidad con al menos 7 días de antelación");
      return;
    }
    setSelectedDate(event.start);
    await loadAvailabilityForDate(event.start);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (franja: string, value: string | number) => {
    setAvailability({ ...availability, [franja]: value });
  };

  useEffect(() => {
    loadAvailabilityForMonth(currentDate);
  }, [currentDate]);

  useImperativeHandle(process.env.NODE_ENV === 'test' ? ref : null, () => ({ handleSelectSlot }));

  return (
    <>
      <Box sx={{ backgroundColor: '#eafaff', minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <NavigationBar />
        <Container sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 4 }}>
          <Paper sx={{ p: 3, backgroundColor: "#f9f9f9", color: '#333', borderRadius: '12px', width: '100%', maxWidth: '1200px', mt: 4 }}>
            <Typography variant="h4" textAlign="center" color="#333" sx={{ fontWeight: 'bold' }}>Mi Disponibilidad</Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <IconButton aria-label="Mes anterior" onClick={() => setCurrentDate(moment(currentDate).subtract(1, "months").toDate())}><ArrowBackIcon /></IconButton>
              <Typography variant="h6">{moment(currentDate).format("MMMM YYYY")}</Typography>
              <IconButton aria-label="Mes siguiente" onClick={() => setCurrentDate(moment(currentDate).add(1, "months").toDate())}><ArrowForwardIcon /></IconButton>
            </Box>
            {renderLegend()}
            <div style={{ minHeight: isMobile ? "500px" : "700px", width: "100%", cursor: 'pointer' }}>
              <Calendar
                data-testid="calendar"
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                eventPropGetter={eventStyleGetter}
                dayPropGetter={dayPropGetter}
                views={{ month: true }}
                components={{ event: renderEventContent, toolbar: () => null }}
                style={{ minHeight: '1000px' }}
              />
            </div>
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm" data-testid="availability-dialog">
              <DialogTitle sx={{ backgroundColor: '#F0F4F8', color: '#333', mb: 3 }}>
                Seleccionar Disponibilidad - {selectedDate && moment(selectedDate).format('DD/MM/YYYY')}
              </DialogTitle>
              <DialogContent sx={{ backgroundColor: '#FFFFFF', color: '#333' }}>
                {['Franja1', 'Franja2', 'Franja3', 'Franja4'].map((franja, index) => {
                  const franjaLabel = `Franja ${index + 1}: ${["9:00-12:00", "12:00-15:00", "15:00-18:00", "18:00-22:00"][index]}`;
                  return (
                    <Box key={index} mb={2}>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={10}>
                          <Autocomplete
                            sx={{ mt: 2 }}
                            fullWidth
                            disablePortal={process.env.NODE_ENV === 'test'}
                            options={[
                              { label: 'Disponible con transporte', value: 1 },
                              { label: 'Disponible sin transporte', value: 2 },
                              { label: 'No disponible', value: 3 },
                            ]}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                            isOptionEqualToValue={(option, value) => option.value === (value as any)?.value}
                            value={[
                              { label: 'Disponible con transporte', value: 1 },
                              { label: 'Disponible sin transporte', value: 2 },
                              { label: 'No disponible', value: 3 },
                            ].find((opt) => opt.value === availability[franja]) || null}
                            onChange={(_, newValue) => handleChange(franja, newValue ? newValue.value : '')}
                            renderInput={(params) => <TextField {...params} label={franjaLabel} variant="outlined" data-testid={`autocomplete-${franja.toLowerCase()}`} />}
                          />
                        </Grid>
                        <Grid item xs={2} display="flex" justifyContent="center" alignItems="center">
                          {availability[franja] === 1 && <IconButton color="primary"><DirectionsCarIcon /></IconButton>}
                          {availability[franja] === 2 && <IconButton color="success"><DirectionsWalkIcon /></IconButton>}
                          {availability[franja] === 3 && <IconButton color="error"><DoNotDisturbIcon /></IconButton>}
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })}
                <TextField
                  fullWidth multiline rows={3} label="Comentarios" variant="outlined"
                  value={availability.comments || ''}
                  onChange={(e) => setAvailability({ ...availability, comments: e.target.value })}
                  sx={{ backgroundColor: '#FFFFFF' }} inputProps={{ maxLength: 200 }}
                />
              </DialogContent>
              <DialogActions sx={{ backgroundColor: '#F0F4F8' }}>
                <Button onClick={handleCloseDialog} color="error">Cancelar</Button>
                <Button onClick={handleSave} color="primary" disabled={loading}>Guardar</Button>

              </DialogActions>
            </Dialog>
          </Paper>
        </Container>
      </Box>
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
});

export default DisponibilidadView;
