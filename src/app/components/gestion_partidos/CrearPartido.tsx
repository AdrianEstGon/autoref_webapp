import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, FormControl } from '@mui/material';
import { Autocomplete } from '@mui/material';
import { Popper } from '@mui/material'; 
import partidosService from '../../services/PartidoService';
import polideportivosService from '../../services/PolideportivoService';
import equiposService from '../../services/EquipoService'; 
import categoriasService from '../../services/CategoriaService'; 
import { toast } from 'react-toastify';
import { validarPartido } from '../../utils/ValidacionesPartidos';

interface CrearPartidoProps {
  open: boolean;
  onClose: () => void;
  onSave: (partido: any) => void;
}

const CrearPartido: React.FC<CrearPartidoProps> = ({ open, onClose, onSave }) => {
  const navigate = useNavigate();

  const [nuevoPartido, setNuevoPartido] = useState({
    equipoLocalId: '',
    equipoVisitanteId: '',
    fecha: '',
    hora: '',
    lugarId: '',
    categoriaId: '', 
    jornada: '',
    numeroPartido: '',
  });

  const [errores, setErrores] = useState({
    equipoLocalId: '',
    equipoVisitanteId: '',
    fecha: '',
    hora: '',
    lugarId: '',
    categoriaId: '',
    jornada: '',
    numeroPartido: '',
  });

  const [polideportivos, setPolideportivos] = useState<{ id: string; nombre: string }[]>([]); // Lista de polideportivos
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]); // Lista de categorías
  const [equiposFiltrados, setEquiposFiltrados] = useState<{ id: string; nombre: string }[]>([]); // Equipos filtrados por categoría
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const polideportivosData = await polideportivosService.getPolideportivos();
        setPolideportivos(polideportivosData);

        const categoriasData = await categoriasService.getCategorias();
        setCategorias(categoriasData);
      } catch (error) {
        toast.error('Error cargando los datos');
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (nuevoPartido.categoriaId) {
      const fetchEquipos = async () => {
        try {
          const equiposData = await equiposService.getEquiposPorCategoria(nuevoPartido.categoriaId); 
          setEquiposFiltrados(equiposData);

          if (equiposData.length === 0) {
            toast.info('No hay equipos disponibles para esta categoría.');
            setNuevoPartido(prevState => ({
              ...prevState,
              equipoLocal: '',
              equipoVisitante: '',
            }));
          }
        } catch (error) {
          toast.error('Error obteniendo los equipos');
        }
      };

      fetchEquipos();
    }
  }, [nuevoPartido.categoriaId]);

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setNuevoPartido(prevState => ({
      ...prevState,
      [name as string]: value,
    }));
  };

  const handleSave = async () => {
    let erroresTemp = { ...errores };
    let isValid = true;

    isValid = validarPartido(nuevoPartido, erroresTemp, isValid);
    setErrores(erroresTemp);

    if (isValid) {
      setLoading(true); 
      try {
        await partidosService.crearPartido(nuevoPartido);
        toast.success('Partido registrado con éxito');
        onClose();
        navigate('/gestionPartidos/partidosView');
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const handleCancel = () => {
    navigate('/gestionPartidos/partidosView');
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>Agregar Nuevo Partido</DialogTitle>
      <DialogContent sx={{ overflowY: 'auto' }}>
        {/* Paso 1: Selección de categoría */}
        <FormControl fullWidth margin="normal" error={!!errores.categoriaId}>
          <Autocomplete
            options={categorias}
            getOptionLabel={(option) => option.nombre}
            value={categorias.find(categoria => categoria.id === nuevoPartido.categoriaId) || null}
            onChange={(_, newValue) => setNuevoPartido(prevState => ({
              ...prevState,
              categoriaId: newValue ? newValue.id : '',
            }))}
            disablePortal
            PopperComponent={(props) => <Popper {...props} placement="bottom-start" />}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Categoría"
                error={!!errores.categoriaId}
                helperText={errores.categoriaId}
                variant="outlined"
              />
            )}
          />
        </FormControl>
        <FormControl fullWidth margin="normal" error={!!errores.equipoLocalId}>
          <Autocomplete
            options={equiposFiltrados}
            getOptionLabel={(option) => option.nombre}
            value={equiposFiltrados.find(equipo => equipo.id === nuevoPartido.equipoLocalId) || null}
            onChange={(_, newValue) => setNuevoPartido(prevState => ({
              ...prevState,
              equipoLocalId: newValue ? newValue.id : '',
            }))}
            disablePortal
            PopperComponent={(props) => <Popper {...props} placement="bottom-start" />}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Equipo Local"
                error={!!errores.equipoLocalId}
                helperText={errores.equipoLocalId}
                disabled={equiposFiltrados.length === 0} // Deshabilitado si no hay equipos disponibles
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="normal" error={!!errores.equipoVisitanteId}>
          <Autocomplete
            options={equiposFiltrados}
            getOptionLabel={(option) => option.nombre}
            value={equiposFiltrados.find(equipo => equipo.id === nuevoPartido.equipoVisitanteId) || null}
            onChange={(_, newValue) => setNuevoPartido(prevState => ({
              ...prevState,
              equipoVisitanteId: newValue ? newValue.id : '',
            }))}
            disablePortal
            PopperComponent={(props) => <Popper {...props} placement="bottom-start" />}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Equipo Visitante"
                error={!!errores.equipoVisitanteId}
                helperText={errores.equipoVisitanteId}
                disabled={equiposFiltrados.length === 0} // Deshabilitado si no hay equipos disponibles
              />
            )}
          />
        </FormControl>
        <TextField
          label="Fecha"
          type="date"
          fullWidth
          margin="normal"
          name="fecha"
          value={nuevoPartido.fecha}
          onChange={handleChange}
          error={!!errores.fecha}
          helperText={errores.fecha}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Hora"
          type="time"
          fullWidth
          margin="normal"
          name="hora"
          value={nuevoPartido.hora}
          onChange={handleChange}
          error={!!errores.hora}
          helperText={errores.hora}
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth margin="normal" error={!!errores.lugarId}>
          <Autocomplete
            options={polideportivos}
            getOptionLabel={(option) => option.nombre}
            value={polideportivos.find(polideportivo => polideportivo.id === nuevoPartido.lugarId) || null}
            onChange={(_, newValue) => setNuevoPartido(prevState => ({
              ...prevState,
              lugarId: newValue ? newValue.id : '',
            }))}
            disablePortal
            PopperComponent={(props) => <Popper {...props} placement="bottom-start" />}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Polideportivo"
                error={!!errores.lugarId}
                helperText={errores.lugarId}
              />
            )}
          />
        </FormControl>

        <TextField
          label="Jornada"
          fullWidth
          margin="normal"
          name="jornada"
          value={nuevoPartido.jornada}
          onChange={handleChange}
          error={!!errores.jornada}
          helperText={errores.jornada}
        />
        <TextField
          label="Número de Partido"
          fullWidth
          margin="normal"
          name="numeroPartido"
          value={nuevoPartido.numeroPartido}
          onChange={handleChange}
          error={!!errores.numeroPartido}
          helperText={errores.numeroPartido}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="error">Cancelar</Button>
        <Button onClick={handleSave} color="primary" disabled={loading}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CrearPartido;
