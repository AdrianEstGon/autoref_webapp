import React, { useState, useEffect } from 'react';
import { 
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Button, Box, Tooltip, TablePagination, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, 
  CircularProgress,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import usuarioService from '../../services/UserService';
import NavBar from '../barra_navegacion/NavBar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Usuario {
  id: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  nivel: string;
  fechaNacimiento: string;
  clubVinculado: string;
  email: string;
  licencia: number;
  codigoPostal: string;
  esAdmin: boolean;
}

const UsuariosView: React.FC = () => {
  const SUPER_ADMIN_LICENCIA = 16409;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosPaginados, setUsuariosPaginados] = useState<Usuario[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true); 

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true); 
      try {
        const data = await usuarioService.getUsuarios();
        const sortedData = data.sort((a: { primerApellido: string; }, b: { primerApellido: string }) => 
          a.primerApellido.localeCompare(b.primerApellido)
        );

        const superAdmin = sortedData.find((u: { licencia: number; }) => u.licencia === SUPER_ADMIN_LICENCIA);
        const otherUsers = sortedData.filter((u: { licencia: number; }) => u.licencia !== SUPER_ADMIN_LICENCIA);
        const finalSortedData = superAdmin ? [superAdmin, ...otherUsers] : otherUsers;

        finalSortedData.forEach((usuario: any) => {
          usuario.esAdmin = usuario.roles?.includes('Admin') || usuario.licencia === SUPER_ADMIN_LICENCIA;
        });

        setUsuarios(finalSortedData);
        setUsuariosPaginados(finalSortedData.slice(0, rowsPerPage));
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      } finally {
        setLoading(false); 
      }
    };

    fetchUsuarios();
  }, [rowsPerPage]);

  const handleModify = (usuario: Usuario) => {
    navigate('/gestionUsuarios/modificarUsuario', { state: { usuario } });
  };

  const handleDelete = async () => {
    if (usuarioToDelete !== null) {
      try {
        await usuarioService.eliminarUsuario(usuarioToDelete);
        const updatedUsuarios = usuarios.filter(user => user.id !== usuarioToDelete);
        setUsuarios(updatedUsuarios);
        const startIndex = page * rowsPerPage;
        setUsuariosPaginados(updatedUsuarios.slice(startIndex, startIndex + rowsPerPage));

        setOpenConfirmDialog(false);
        setUsuarioToDelete(null);
        toast.success('Usuario eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setUsuarioToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenConfirmDialog(false);
    setUsuarioToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const handleAdd = () => {
    navigate('/gestionUsuarios/crearUsuario');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    const startIndex = newPage * rowsPerPage;
    setUsuariosPaginados(usuarios.slice(startIndex, startIndex + rowsPerPage));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setUsuariosPaginados(usuarios.slice(0, newRowsPerPage));
  };

   return (
    <>
      <NavBar />
      <Box sx={{ backgroundColor: '#eafaff', minHeight: '100vh', pt: 3, pb: 3 }}>
        <Container sx={{ backgroundColor: '#eafaff', borderRadius: 2, minWidth: '90%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column' }}>
              <CircularProgress color="primary" />
              <Typography variant="h6" mt={2}>Cargando usuarios...</Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, backgroundColor: '#fafafa' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={9} sx={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
                        Gestión de Usuarios
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: '#f0f0f0', color: '#333' }}>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Nombre</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Primer apellido</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Segundo apellido</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Nivel</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Fecha de Nacimiento</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Club Vinculado</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Correo Electrónico</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Número de Licencia</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosPaginados.map((usuario) => (
                      <TableRow
                        key={usuario.id}
                        sx={{
                          backgroundColor: usuario.licencia === SUPER_ADMIN_LICENCIA ? '#fff3cd' : 'inherit',
                          '&:hover': {
                            backgroundColor: usuario.licencia === SUPER_ADMIN_LICENCIA ? '#ffe8a1' : '#e8e8e8',
                          },
                          transition: '0.3s',
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center' }}>{usuario.nombre}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{usuario.primerApellido}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{usuario.segundoApellido}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{usuario.nivel}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{formatDate(usuario.fechaNacimiento)}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{usuario.clubVinculado}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{usuario.email}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{usuario.licencia}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {usuario.licencia !== SUPER_ADMIN_LICENCIA ? (
                            <Tooltip title="Modificar usuario" arrow>
                              <IconButton color="primary" onClick={() => handleModify(usuario)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            JSON.parse(localStorage.getItem('licencia') || 'null') === SUPER_ADMIN_LICENCIA && (
                              <Tooltip title="Modificar usuario" arrow>
                                <IconButton color="primary" onClick={() => handleModify(usuario)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )
                          )}
                          {usuario.licencia !== SUPER_ADMIN_LICENCIA && (
                            <Tooltip title="Eliminar usuario" arrow>
                              <IconButton
                                color="error"
                                onClick={() => handleOpenDeleteDialog(usuario.id)}
                                aria-label="eliminar usuario"
                                data-testid="delete-user-button"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box 
                sx={{ 
                  position: 'fixed', 
                  bottom: 0, 
                  left: 0, 
                  width: '100%', 
                  backgroundColor: '#eafaff', 
                  borderTop: '1px solid #ccc', 
                  py: 2, 
                  px: { xs: 2, sm: 4, md: 8 }, 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  zIndex: 10,
                }}
              >
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />} 
                  onClick={handleAdd}
                  sx={{ mb: { xs: 1, sm: 0 } }}
                >
                  Agregar Usuario
                </Button>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={usuarios.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                  sx={{ mr: { xs: 0, sm: 4, md: 12 } }}
                />
              </Box>
            </>
          )}
        </Container>
      </Box>

      <Dialog open={openConfirmDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="error">Cancelar</Button>
          <Button onClick={handleDelete} color="primary">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UsuariosView;
