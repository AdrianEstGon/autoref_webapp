import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, FormControl } from '@mui/material';
import { Autocomplete, Popper } from '@mui/material';
import partidosService from '../../services/PartidoService';
import polideportivosService from '../../services/PolideportivoService';
import equiposService from '../../services/EquipoService';
import categoriasService from '../../services/CategoriaService';
import { toast } from 'react-toastify';
import { validarPartido } from '../../utils/ValidacionesPartidos';

interface ModificarPartidoProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (partido: any) => void;
}

const ModificarPartido: React.FC<ModificarPartidoProps> = ({ open, onClose, onUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const partido = location.state?.partido || null;

  const [partidoModificado, setPartidoModificado] = useState<any>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [polideportivos, setPolideportivos] = useState<{ id: string; nombre: string }[]>([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState<{ id: string; nombre: string }[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partido) {
      setPartidoModificado({ ...partido });
    }
  }, [partido]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const polideportivosData = await polideportivosService.getPolideportivos();
        setPolideportivos(polideportivosData);

        const categoriasData = await categoriasService.getCategorias();
        setCategorias(categoriasData);

        if (partido) {
          setPartidoModificado({ ...partido });
        }
      } catch (error) {
        toast.error('Error cargando los datos');
      }
    };

    fetchData();
  }, [open, partido]);

  useEffect(() => {
    if (partidoModificado?.categoriaId) {
      const fetchEquipos = async () => {
        try {
          const equiposData = await equiposService.getEquiposPorCategoria(partidoModificado.categoriaId);
          setEquiposFiltrados(equiposData);

          if (equiposData.length === 0) {
            toast.info('No hay equipos disponibles para esta categoría.');
          }
        } catch (error) {
          toast.error('Error obteniendo los equipos');
        }
      };

      fetchEquipos();
    }
  }, [partidoModificado?.categoriaId]);

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setPartidoModificado((prevState: any) => ({
      ...prevState,
      [name as string]: value,
    }));
  };

  const handleSave = async () => {
    let erroresTemp: {
      equipoLocalId: string;
      equipoVisitanteId: string;
      fecha: string;
      hora: string;
      lugarId: string;
      categoriaId: string;
      jornada: string;
      numeroPartido: string;
    } = {
      equipoLocalId: '',
      equipoVisitanteId: '',
      fecha: '',
      hora: '',
      lugarId: '',
      categoriaId: '',
      jornada: '',
      numeroPartido: '',
    };
    let isValid = true;

    isValid = validarPartido(partidoModificado, erroresTemp, isValid);
    setErrores(erroresTemp);

    if (isValid) {
      setLoading(true); 
      try {
        await partidosService.actualizarPartido(partidoModificado);
        toast.success('Partido actualizado con éxito');
        onUpdate(partidoModificado);
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

  if (!partidoModificado) return null;

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="lg">
      <DialogTitle>Modificar Partido</DialogTitle>
      <DialogContent sx={{ overflowY: 'auto' }}>
        <FormControl fullWidth margin="normal" error={!!errores.categoriaId}>
          <Autocomplete
            options={categorias}
            getOptionLabel={(option) => option.nombre}
            value={categorias.find(categoria => categoria.id === partidoModificado.categoriaId) || null}
            onChange={(_, newValue) => setPartidoModificado((prevState: any) => ({
              ...prevState,
              categoriaId: newValue ? newValue.id : '',
            }))}
            disablePortal
            PopperComponent={(props) => <Popper {...props} placement="bottom-start" />}
            renderInput={(params) => (
              <TextField {...params} label="Categoría" error={!!errores.categoriaId} helperText={errores.categoriaId} variant="outlined" />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="normal" error={!!errores.equipoLocalId}>
          <Autocomplete
            options={equiposFiltrados}
            getOptionLabel={(option) => option.nombre}
            value={equiposFiltrados.find(equipo => equipo.id === partidoModificado.equipoLocalId) || null}
            onChange={(_, newValue) => setPartidoModificado((prevState: any) => ({
              ...prevState,
              equipoLocalId: newValue ? newValue.id : '',
            }))}
            disablePortal
            PopperComponent={(props) => <Popper {...props} placement="bottom-start" />}
            renderInput={(params) => (
              <TextField {...params} label="Equipo Local" error={!!errores.equipoLocalId} helperText={errores.equipoLocalId} />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="normal" error={!!errores.equipoVisitanteId}>
          <Autocomplete
            options={equiposFiltrados}
            getOptionLabel={(option) => option.nombre}
            value={equiposFiltrados.find(equipo => equipo.id === partidoModificado.equipoVisitanteId) || null}
            onChange={(_, newValue) => setPartidoModificado((prevState: any) => ({
              ...prevState,
              equipoVisitanteId: newValue ? newValue.id : '',
            }))}
            disablePortal
            PopperComponent={(props) => <Popper {...props} placement="bottom-start" />}
            renderInput={(params) => (
              <TextField {...params} label="Equipo Visitante" error={!!errores.equipoVisitanteId} helperText={errores.equipoVisitanteId} />
            )}
          />
        </FormControl>

        <TextField
          label="Fecha"
          type="date"
          fullWidth
          margin="normal"
          name="fecha"
          value={partidoModificado.fecha ? partidoModificado.fecha.split('T')[0] : ''} 
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
          value={partidoModificado.hora || ''}
          onChange={handleChange}
          error={!!errores.hora}
          helperText={errores.hora}
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth margin="normal" error={!!errores.lugarId}>
          <Autocomplete
            options={polideportivos}
            getOptionLabel={(option) => option.nombre}
            value={polideportivos.find(polideportivo => polideportivo.id === partidoModificado.lugarId) || null}
            onChange={(_, newValue) => setPartidoModificado((prevState: any) => ({
              ...prevState,
              lugarId: newValue ? newValue.id : '',
            }))}
            disablePortal
            PopperComponent={(props) => <Popper {...props} placement="bottom-start" />}
            renderInput={(params) => (
              <TextField {...params} label="Polideportivo" error={!!errores.lugarId} helperText={errores.lugarId} />
            )}
          />
        </FormControl>

        <TextField
          label="Jornada"
          fullWidth
          margin="normal"
          name="jornada"
          value={partidoModificado.jornada || ''}
          onChange={handleChange}
          error={!!errores.jornada}
          helperText={errores.jornada}
        />

        <TextField
          label="Número de Partido"
          fullWidth
          margin="normal"
          name="numeroPartido"
          value={partidoModificado.numeroPartido || ''}
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

export default ModificarPartido;
