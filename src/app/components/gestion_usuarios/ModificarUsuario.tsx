import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, FormControlLabel, Checkbox, SelectChangeEvent, Autocomplete, TextFieldVariants, FilledTextFieldProps, OutlinedTextFieldProps, StandardTextFieldProps } from '@mui/material';
import authService from '../../services/UserService'; 
import clubsService from '../../services/ClubService'; 
import { validaciones } from '../../utils/ValidacionesUsuarios';
import { toast } from 'react-toastify';
import { niveles } from '../../utils/UserUtils';

interface ModificarUsuarioProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  usuario: {
    id: string;
    nombre: string;
    primerApellido: string;
    segundoApellido: string;
    fechaNacimiento: string;
    nivel: string;
    clubVinculadoId: string;
    licencia: string;
    email: string;
    username: string;
    password: string;
    direccion: string;
    pais: string;
    region: string;
    ciudad: string;
    codigoPostal: string;
    esAdmin: boolean;
  };
}

const ModificarUsuario: React.FC<ModificarUsuarioProps> = ({ open, onClose, onUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = location.state?.usuario || {};

  const [usuarioEditado, setUsuarioEditado] = useState({ ...usuario });
  const [errores, setErrores] = useState({
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    fechaNacimiento: '',
    nivel: '',
    clubVinculadoId: '', 
    licencia: '',
    username: '',
    email: '',
    password: '',
    direccion: '',
    pais: '',
    region: '',
    ciudad: '',
    codigoPostal: '',
    esAdmin: ''
  });
  const [loading, setLoading] = useState(false); 
  const [clubes, setClubes] = useState<any[]>([]);

  useEffect(() => {
    if (usuario) {
      setUsuarioEditado({ ...usuario });
    }

    const fetchClubs = async () => {
      try {
        const clubesData = await clubsService.getClubs();
        setClubes(clubesData);
      } catch {
        toast.error("Error al cargar los clubes");
      }
    };

    fetchClubs();
  }, [usuario]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;

    if (name === 'clubVinculado') {
      const selectedClub = clubes.find(club => club.id === value);

      if (selectedClub) {
        setUsuarioEditado((prevState: any) => ({
          ...prevState,
          clubVinculadoId: selectedClub.id,
          clubVinculado: selectedClub.nombre
        }));
      } else {
        // Permitir club vinculado vacío (opcional)
        setUsuarioEditado((prevState: any) => ({
          ...prevState,
          clubVinculadoId: '',
          clubVinculado: ''
        }));
      }
    } else {
      setUsuarioEditado((prevState: any) => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsuarioEditado((prevState: any) => ({
      ...prevState,
      esAdmin: e.target.checked
    }));
  };

  const handleSave = async () => {
    let erroresTemp = { ...errores };
    let isValid = validaciones(usuarioEditado, erroresTemp, true);
    setErrores(erroresTemp);

    if (!isValid) return;

    const hayCambios = JSON.stringify(usuarioEditado) !== JSON.stringify(usuario);
    if (!hayCambios) {
      toast.warning("No hay cambios para guardar.");
      onClose();
      navigate('/gestionUsuarios/usuariosView');
      return;
    }

    try {
      setLoading(true); 
      await authService.updateUser(usuarioEditado);
      toast.success('Usuario actualizado con éxito');
      onUpdate();
      onClose();
      navigate('/gestionUsuarios/usuariosView');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/gestionUsuarios/usuariosView');
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Modificar Usuario</DialogTitle>
      <DialogContent>
        <TextField label="Nombre" fullWidth margin="normal" name="nombre" value={usuarioEditado.nombre} onChange={handleChange} error={!!errores.nombre} helperText={errores.nombre} />
        <TextField label="Primer Apellido" fullWidth margin="normal" name="primerApellido" value={usuarioEditado.primerApellido} onChange={handleChange} error={!!errores.primerApellido} helperText={errores.primerApellido} />
        <TextField label="Segundo Apellido" fullWidth margin="normal" name="segundoApellido" value={usuarioEditado.segundoApellido} onChange={handleChange} error={!!errores.segundoApellido} helperText={errores.segundoApellido} />
        <TextField label="Fecha de Nacimiento" type="date" fullWidth margin="normal" name="fechaNacimiento" value={new Date(usuarioEditado.fechaNacimiento).toLocaleDateString('en-CA')} onChange={handleChange} error={!!errores.fechaNacimiento} helperText={errores.fechaNacimiento} InputLabelProps={{ shrink: true }} />

        <Autocomplete
          options={niveles}
          value={usuarioEditado.nivel || ''}
          onChange={(e: any, newValue: any) => {
            setUsuarioEditado((prevState: any) => ({
              ...prevState,
              nivel: newValue || ''
            }));
          }}
          renderInput={(params: React.JSX.IntrinsicAttributes & { variant?: TextFieldVariants | undefined; } & Omit<FilledTextFieldProps | OutlinedTextFieldProps | StandardTextFieldProps, "variant">) => (
            <TextField {...params} label="Nivel" margin="normal" fullWidth />
          )}
        />

        <Autocomplete
          options={clubes}
          getOptionLabel={(option) => option.nombre || ''}
          value={clubes.find(club => club.id === usuarioEditado.clubVinculadoId) || null}
          onChange={(e, newValue) => {
            if (newValue) {
              setUsuarioEditado((prevState: any) => ({
                ...prevState,
                clubVinculadoId: newValue.id,
                clubVinculado: newValue.nombre
              }));
            } else {
              setUsuarioEditado((prevState: any) => ({
                ...prevState,
                clubVinculadoId: null,
                clubVinculado: null
              }));
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Club Vinculado" margin="normal" fullWidth />
          )}
        />

        <TextField label="Correo Electrónico" fullWidth margin="normal" name="email" value={usuarioEditado.email} onChange={handleChange} error={!!errores.email} helperText={errores.email} />
        <TextField label="Licencia" fullWidth margin="normal" name="licencia" value={usuarioEditado.licencia} onChange={handleChange} error={!!errores.licencia} helperText={errores.licencia} />
        <TextField label="Código Postal" fullWidth margin="normal" name="codigoPostal" value={usuarioEditado.codigoPostal} onChange={handleChange} error={!!errores.codigoPostal} helperText={errores.codigoPostal} />
        <TextField label="Dirección" fullWidth margin="normal" name="direccion" value={usuarioEditado.direccion} onChange={handleChange} error={!!errores.direccion} helperText={errores.direccion} />
        <TextField label="País" fullWidth margin="normal" name="pais" value={usuarioEditado.pais} onChange={handleChange} error={!!errores.pais} helperText={errores.pais} />
        <TextField label="Provincia" fullWidth margin="normal" name="region" value={usuarioEditado.region} onChange={handleChange} error={!!errores.region} helperText={errores.region} />
        <TextField label="Municipio" fullWidth margin="normal" name="ciudad" value={usuarioEditado.ciudad} onChange={handleChange} error={!!errores.ciudad} helperText={errores.ciudad} />

        <FormControlLabel control={<Checkbox checked={usuarioEditado.esAdmin} onChange={handleCheckboxChange} />} label="Asignar rol de Administrador" />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="error">Cancelar</Button>
        <Button onClick={handleSave} color="primary" disabled={loading}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModificarUsuario;
