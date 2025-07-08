import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Menu, MenuItem, Box, IconButton, useMediaQuery, Drawer, Avatar, Typography, List, CardContent, Card, Divider, Collapse, Tooltip } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';  
import AccountCircleIcon from '@mui/icons-material/AccountCircle';  
import MenuIcon from '@mui/icons-material/Menu';  
import PeopleIcon from '@mui/icons-material/People';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge } from '@mui/material';
import notificacionesService from '../../services/NotificacionService';
import toast from 'react-hot-toast';

const NavigationBar = () => {
  const [anchorElPanel, setAnchorElPanel] = useState<null | HTMLElement>(null);
  const [anchorElPanelPerfil, setAnchorElPanelPerfil] = useState<null | HTMLElement>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [slidingOutNotification, setSlidingOutNotification] = useState<string | null>(null); 
  const [userLogged, setUserLogged] = useState<any | null>(null);

useEffect(() => {
  const storedUser = window.localStorage.getItem('userLogged');
  const infoUser = storedUser ? JSON.parse(storedUser) : null;
  setUserLogged(infoUser);

  if (infoUser) {
    const sessionExpired = hasSessionExpired(infoUser);
    if (sessionExpired) {
      window.localStorage.removeItem('userLogged');
      window.localStorage.removeItem('userRole');
      window.localStorage.removeItem('fotoPerfil');
      setUserLogged(null);
      navigate('/');
      toast.error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
    }
  }
}, []);

const hasSessionExpired = (dataUser: any) => {
  const currentTime = new Date().getTime();
  const userTime = new Date(dataUser.timestamp).getTime();
  const threeHour = 60 * 60 * 1000 * 3;
  return (currentTime - userTime) >= threeHour; // 3 horas de inactividad
};
  
  useEffect(() => {
    const role = window.localStorage.getItem('userRole');
    const foto = window.localStorage.getItem('fotoPerfil');
    setUserRole(role);
    setProfilePhoto(foto && foto !== '{}' ? foto : null);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
        if (!user?.id) return;
  
        const ahora = new Date();
  
        // 1. Eliminar notificaciones antiguas (comparar fecha completa)
        const todas = await notificacionesService.getNotificaciones(); 
        await Promise.all(todas.map(async (n: any) => {
          const fechaNoti = new Date(n.fecha);
          if (fechaNoti < ahora) {
            await notificacionesService.eliminarNotificacion(n.id);
          }
        }));
  
        // 2. Cargar notificaciones del usuario
        const notificacionesUsuario = await notificacionesService.getNotificacionesPorUsuario(user.id);
        const futuras = notificacionesUsuario.filter((n: any) => {
          const fecha = new Date(n.fecha);
          return fecha >= ahora && !n.leida;
        });
  
        setNotifications(futuras);
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      }
    };
  
    fetchNotifications();
  }, []);
  
  
  

  const marcarComoLeida = async (id: string) => {
    try {
      const notificacion = notifications.find((n) => n.id === id);
      if (!notificacion) return;

      const notificacionActualizada = { ...notificacion, leida: true };

      await notificacionesService.actualizarNotificacion(id, notificacionActualizada);

      // Marca la notificación para que se deslice hacia la derecha
      setSlidingOutNotification(id);

      // Elimina la notificación después de un pequeño retraso para que se vea el efecto de deslizamiento
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setSlidingOutNotification(null); // Resetea la notificación deslizada
      }, 500); // 500 ms (tiempo de la animación) antes de eliminarla
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleMenuPanelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElPanel(event.currentTarget);
  };

  const handleMenuPanelPerfilClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElPanelPerfil(event.currentTarget);
  };

  const handleClosePanelMenu = () => {
    setAnchorElPanel(null);
  };

  const handleClosePanelMenuPerfil = () => {
    setAnchorElPanelPerfil(null);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('userLogged');
    window.localStorage.removeItem('userRole');
    window.localStorage.removeItem('fotoPerfil');
    window.location.href = '/';
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClosePanelMenu();
  };

  return (
    <div>
      <AppBar position="sticky">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open menu"
              edge="start"
              sx={{ mr: 2 }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/misDesignaciones')}>Mis Designaciones</Button>
              <Button color="inherit" onClick={() => navigate('/miDisponibilidad')}>Disponibilidad</Button>
              <Button color="inherit" onClick={() => navigate('/miHistorial')}>Mi Historial</Button>

              {userRole === 'Admin' && (
                <>
                  <Button color="inherit" onClick={handleMenuPanelClick}>
                    Panel de control
                  </Button>
                  <Menu
                    anchorEl={anchorElPanel}
                    open={Boolean(anchorElPanel)}
                    onClose={handleClosePanelMenu}
                  >
                    <MenuItem onClick={() => handleNavigate('/gestionUsuarios/usuariosView')}>
                      <PeopleIcon sx={{ mr: 1 }} /> Gestión de usuarios
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate('/gestionPartidos/partidosView')}>
                      <SportsSoccerIcon sx={{ mr: 1 }} /> Gestión de partidos
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate('/gestionDesignaciones/panelDesignaciones')}>
                      <AssignmentIcon sx={{ mr: 1 }} /> Gestión de designaciones
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            <IconButton color="inherit" onClick={() => setOpenNotifications(true)} sx={{ mr: 2 }}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Drawer anchor="right" open={openNotifications} onClose={() => setOpenNotifications(false)}>
              <Box
                sx={{
                  width: isMobile ? '100vw' : 400,
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#f9fafb',
                }}
              >
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Notificaciones
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                  {notifications.length > 0 ? (
                    <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {notifications.map((notification) => (
                        <Card
                          variant="outlined"
                          key={notification.id}
                          sx={{
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            boxShadow: 1,
                            position: 'relative',
                            transition: 'transform 0.5s ease-out', // Animación suave
                            transform: slidingOutNotification === notification.id ? 'translateX(100%)' : 'translateX(0)', // Deslizar la tarjeta hacia la derecha
                            overflow: 'hidden', // Para evitar que el contenido se desborde
                          }}
                        >
                          <CardContent sx={{ p: 2, pb: 6 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                mb: 1,
                                fontStyle: 'italic',
                                color: 'text.secondary',
                                fontWeight: '400',
                                lineHeight: 1.5,
                              }}
                            >
                              {notification.mensaje}
                            </Typography>
                          </CardContent>

                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 16,
                              right: 16,
                              display: 'flex',
                              alignItems: 'center',
                              zIndex: 1000,
                            }}
                          >
                            <Tooltip title="Marcar como leída">
                              <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                onClick={() => marcarComoLeida(notification.id)}
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <CheckCircleIcon sx={{ marginRight: 1 }} />
                                Marcar como leída
                              </Button>
                            </Tooltip>
                          </Box>
                        </Card>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" textAlign="center" sx={{ mt: 4 }}>
                      No hay notificaciones disponibles.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Drawer>

            <Button title="Mi perfil" color="inherit" sx={{ display: 'flex', alignItems: 'center' }} onClick={handleMenuPanelPerfilClick}>
              {profilePhoto ? (
                <Avatar src={profilePhoto} sx={{ width: 32, height: 32, mr: 1 }} />
              ) : (
                <AccountCircleIcon sx={{ mr: 1 }} />
              )}
            </Button>

            <Menu
              anchorEl={anchorElPanelPerfil}
              open={Boolean(anchorElPanelPerfil)}
              onClose={handleClosePanelMenuPerfil}
            >
              <MenuItem onClick={() => handleNavigate('/miPerfil')}>
                <AccountCircleIcon sx={{ mr: 1 }} /> Mi perfil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToAppIcon sx={{ mr: 1, color: 'red' }} /> Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
        >
          <Box
            sx={{
              width: 250,
              p: 2,
            }}
            role="presentation"
            onClick={handleDrawerToggle}
            onKeyDown={handleDrawerToggle}
          >
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button color="inherit" onClick={() => navigate('/misDesignaciones')}>Mis Designaciones</Button>
              <Button color="inherit" onClick={() => navigate('/miDisponibilidad')}>Disponibilidad</Button>
              <Button color="inherit" onClick={() => navigate('/miHistorial')}>Mi Historial</Button>

              {userRole === 'Admin' && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Panel de control
                  </Typography>
                  <Button onClick={() => handleNavigate('/gestionUsuarios/usuariosView')}>
                    <PeopleIcon sx={{ mr: 1 }} /> Gestión de usuarios
                  </Button>
                  <Button onClick={() => handleNavigate('/gestionPartidos/partidosView')}>
                    <SportsSoccerIcon sx={{ mr: 1 }} /> Gestión de partidos
                  </Button>
                  <Button onClick={() => handleNavigate('/gestionDesignaciones/panelDesignaciones')}>
                    <AssignmentIcon sx={{ mr: 1 }} /> Gestión de designaciones
                  </Button>
                </>
              )}
            </List>
          </Box>
        </Drawer>

    </div>
  );
};

export default NavigationBar;
