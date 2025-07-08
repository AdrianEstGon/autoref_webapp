import React, { useState, useEffect } from 'react';
import { 
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Button, Box, TablePagination, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Typography as MuiTypography,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile'; 
import partidosService from '../../services/PartidoService'; 
import polideportivoService from '../../services/PolideportivoService';
import equiposService from '../../services/EquipoService';
import categoriaService from '../../services/CategoriaService';
import NavBar from '../barra_navegacion/NavBar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import * as XLSX from 'xlsx';

interface Partido {
  id: number;
  fecha: string;
  hora: string;
  lugar: string;
  equipoLocal: string;
  equipoVisitante: string;
  categoria: string;
  jornada: number;
  numeroPartido: number;
  polideportivoId?: number;
}

const PartidosView: React.FC = () => {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [partidosPaginados, setPartidosPaginados] = useState<Partido[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [partidoToDelete, setPartidoToDelete] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true); // Estado de carga

  const navigate = useNavigate();
  const fetchPartidos = async () => {
    try {
      const data = await partidosService.getPartidos();
      const sortedPartidos = data.sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      setPartidos(sortedPartidos);
    } catch (error) {
      console.error('Error al obtener los partidos:', error);
    } finally {
      setLoading(false); // Asegúrate de finalizar la carga
    }
  };

  useEffect(() => {
    fetchPartidos();
  }, []); 
  
  useEffect(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setPartidosPaginados(partidos.slice(startIndex, endIndex));
  }, [partidos, page, rowsPerPage]);

  const handleModify = (partido: Partido) => {
    navigate('/gestionPartidos/modificarPartido', { state: { partido } });
  };

  const handleDelete = async () => {
    if (partidoToDelete !== null) {
      try {
        await partidosService.eliminarPartido(partidoToDelete);
        const updatedPartidos = partidos.filter(p => p.id !== partidoToDelete);
        setPartidos(updatedPartidos);

        const startIndex = page * rowsPerPage;
        setPartidosPaginados(updatedPartidos.slice(startIndex, startIndex + rowsPerPage));

        setOpenConfirmDialog(false);
        setPartidoToDelete(null);
        toast.success('Partido eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar partido:', error);
        toast.error('Hubo un error al eliminar el partido');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '00:00';

    try {
      const time = new Date(`1970-01-01T${timeString}Z`);
      if (isNaN(time.getTime())) throw new Error('Hora inválida');
      return time.toISOString().substr(11, 5);
    } catch (error) {
      console.error('Error al formatear la hora:', timeString);
      return '00:00';
    }
  };

  const handleAdd = () => {
    navigate('/gestionPartidos/crearPartido');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    const startIndex = newPage * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setPartidosPaginados(partidos.slice(startIndex, endIndex));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setPartidosPaginados(partidos.slice(0, newRowsPerPage));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setSelectedFile(file);
  
      const reader = new FileReader();
  
      reader.onload = async (event) => {
        const binaryStr = event.target?.result;
        const wb = XLSX.read(binaryStr, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
  
        const formatDateFromExcel = (excelValue: string | number) => {
          if (typeof excelValue === 'number') {
            // Convertir el número de serie de Excel a fecha
            const excelEpoch = new Date(1900, 0, 1);
            const convertedDate = new Date(excelEpoch.getTime() + (excelValue - 1) * 86400000);
            return `${convertedDate.getFullYear()}-${String(convertedDate.getMonth() + 1).padStart(2, '0')}-${String(convertedDate.getDate()).padStart(2, '0')}`;
          } else if (typeof excelValue === 'string') {
            const parts = excelValue.split('/');
            if (parts.length === 3) {
              return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }
          return '';
        };
  
        const nuevosPartidos = await Promise.all(
          data.map(async (item: any) => {
            let lugar = item.Lugar;
            let lugarId = null;
            let equipoLocal = null;
            let equipoLocalId = null;
            let equipoVisitante = null;
            let equipoVisitanteId = null;
            let categoria = null;
            let categoriaId = null;
  
            if (!lugar || lugar.toLowerCase() === "por determinar") {
              lugar = null;
              lugarId = null;
            } else {
              const polideportivo = await polideportivoService.getPolideportivoByName(lugar);
              if (polideportivo) {
                lugar = polideportivo.nombre;
                lugarId = polideportivo.id;
              } else {
                lugar = null;
                lugarId = null;
              }
            }
  
            if (item.EquipoLocal) {
              const equipoLocalData = await equiposService.getEquipoByNameAndCategory(item.EquipoLocal, item.Categoria);
              if (equipoLocalData) {
                equipoLocalId = equipoLocalData.id;
                equipoLocal = equipoLocalData.nombre;
              }
            }
  
            if (item.EquipoVisitante) {
              const equipoVisitanteData = await equiposService.getEquipoByNameAndCategory(item.EquipoVisitante, item.Categoria);
              if (equipoVisitanteData) {
                equipoVisitanteId = equipoVisitanteData.id;
                equipoVisitante = equipoVisitanteData.nombre;
              }
            }
  
            if (item.Categoria) {
              const categoriaData = await categoriaService.getCategoriaByName(item.Categoria);
              if (categoriaData) {
                categoriaId = categoriaData.id;
                categoria = categoriaData.nombre;
              }
            }
  
            return {
              fecha: formatDateFromExcel(item.Fecha),
              hora: item.Hora,
              lugar: lugar,
              equipoLocal: equipoLocal,
              equipoVisitante: equipoVisitante,
              categoria: categoria,
              jornada: item.Jornada,
              numeroPartido: item.NumeroPartido,
              lugarId: lugarId,
              equipoLocalId: equipoLocalId,
              equipoVisitanteId: equipoVisitanteId,
              categoriaId: categoriaId
            };
          })
        );
  
        try {
          const partidosCreados = await Promise.all(
            nuevosPartidos.map(async (partido) => {
              const partidoCreado = await partidosService.crearPartido(partido);
              return partidoCreado;
            })
          );
  
          toast.success('Partidos cargados correctamente');
  
          setPartidos((prevPartidos) => {
            const nuevosPartidos = [...prevPartidos, ...partidosCreados];
            setPartidosPaginados(nuevosPartidos.slice(0, rowsPerPage));
            return nuevosPartidos;
          });
  
          setPartidosPaginados((prevPartidos) => [...prevPartidos, ...partidosCreados].slice(0, rowsPerPage));
          fetchPartidos();
        } catch (error) {
          console.error('Error al cargar los partidos:', error);
          toast.error('Hubo un error al cargar los partidos');
        }
      };
  
      reader.readAsBinaryString(file);
    }
  };

  return (
  <>
    <NavBar />
    <Box sx={{ backgroundColor: '#eafaff', minHeight: '100vh', pt: 3, pb: 3 }}>
      <Container sx={{ backgroundColor: '#eafaff', borderRadius: 2, minWidth: '90%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column' }}>
            <CircularProgress color="primary" />
            <MuiTypography variant="h6" mt={2}>Cargando partidos...</MuiTypography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={8} sx={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#fafafa' }}>
                      Gestión de Partidos
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hora</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Lugar</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Equipo Local</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Equipo Visitante</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Jornada</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <MuiTypography variant="subtitle1" color="textSecondary">
                          No hay partidos registrados actualmente.
                        </MuiTypography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    partidos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(partido => (
                      <TableRow key={partido.id ?? `temp-${Math.random()}`}>
                        <TableCell align="center">{formatDate(partido.fecha)}</TableCell>
                        <TableCell align="center">{formatTime(partido.hora)}</TableCell>
                        <TableCell align="center">{partido.lugar || '-'}</TableCell>
                        <TableCell align="center">{partido.equipoLocal}</TableCell>
                        <TableCell align="center">{partido.equipoVisitante}</TableCell>
                        <TableCell align="center">{partido.categoria}</TableCell>
                        <TableCell align="center">{partido.jornada}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleModify(partido)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => { setPartidoToDelete(partido.id); setOpenConfirmDialog(true); }} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'left', gap: 2, mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleAdd} startIcon={<AddIcon />}>
                  Agregar Partido
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    color: 'green',
                    borderColor: 'green',
                    '&:hover': {
                      borderColor: 'green',
                      backgroundColor: 'rgba(0, 128, 0, 0.1)',
                    },
                  }}
                >
                  <UploadFileIcon /> Importar partidos desde Excel
                  <input type="file" id="upload-file" accept=".xlsx, .xls" onChange={handleFileUpload} hidden />
                </Button>
              </Box>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={partidos.length}
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

        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
          <DialogTitle>Eliminar Partido</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar este partido? Esta acción no se puede deshacer
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDialog(false)}>Cancelar</Button>
            <Button onClick={handleDelete} color="error">Eliminar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  </>
);

};

export default PartidosView;
