import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModificarUsuario from '../app/components/gestion_usuarios/ModificarUsuario';
import { BrowserRouter } from 'react-router-dom';
import authService from '../app/services/UserService';
import clubsService from '../app/services/ClubService';

const mockedNavigate = jest.fn();
const mockedOnClose = jest.fn();
const mockedOnUpdate = jest.fn();

const mockUsuario = {
  id: '123',
  nombre: 'Carlos',
  primerApellido: 'Santos',
  segundoApellido: 'Lopez',
  fechaNacimiento: '1988-07-10',
  nivel: "Nivel II Pista",
  clubVinculadoId: '1',
  licencia: '55555',
  email: 'carlos@example.com',
  username: 'carlos@example.com',
  password: '',
  direccion: 'Av. Siempre Viva 742',
  pais: 'España',
  region: 'Barcelona',
  ciudad: 'Barcelona',
  codigoPostal: '08001',
  esAdmin: false,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({
    state: { usuario: mockUsuario }
  }),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div />,
}));

jest.mock('../app/services/UserService', () => ({
  updateUser: jest.fn(),
}));

jest.mock('../app/services/ClubService', () => ({
  getClubs: jest.fn(),
}));

const setup = async (usuarioProp = mockUsuario) => {
  (clubsService.getClubs as jest.Mock).mockResolvedValue([
    { id: '1', nombre: 'Club A' },
  ]);

  render(
    <BrowserRouter>
      <ModificarUsuario open={true} onClose={mockedOnClose} onUpdate={mockedOnUpdate} usuario={usuarioProp} />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(clubsService.getClubs).toHaveBeenCalled();
  });
};

describe('ModificarUsuario Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Los campos se inicializan con los datos del usuario recibido', async () => {
    await setup();

    expect(screen.getByLabelText(/Nombre/i)).toHaveValue(mockUsuario.nombre);
    expect(screen.getByLabelText(/Primer Apellido/i)).toHaveValue(mockUsuario.primerApellido);
    expect(screen.getByLabelText(/Segundo Apellido/i)).toHaveValue(mockUsuario.segundoApellido);
    expect(screen.getByLabelText(/Fecha de Nacimiento/i)).toHaveValue(mockUsuario.fechaNacimiento);
    expect(screen.getByLabelText(/Correo Electrónico/i)).toHaveValue(mockUsuario.email);
    expect(screen.getByLabelText(/Licencia/i)).toHaveValue(mockUsuario.licencia);
    expect(screen.getByLabelText(/Código Postal/i)).toHaveValue(mockUsuario.codigoPostal);
    expect(screen.getByLabelText(/Dirección/i)).toHaveValue(mockUsuario.direccion);
    expect(screen.getByLabelText(/País/i)).toHaveValue(mockUsuario.pais);
    expect(screen.getByLabelText(/Provincia/i)).toHaveValue(mockUsuario.region);
    expect(screen.getByLabelText(/Municipio/i)).toHaveValue(mockUsuario.ciudad);
    expect(screen.getByLabelText(/Asignar rol de Administrador/i)).not.toBeChecked();
  });

  test('Campos vacíos disparan mensajes de validación', async () => {
    await setup({
      ...mockUsuario,
      nombre: '',
      primerApellido: '',
    });

    await userEvent.clear(screen.getByLabelText(/Nombre/i));
    await userEvent.clear(screen.getByLabelText(/Primer Apellido/i));

    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(screen.getByText('Nombre no válido. Solo se permiten caracteres alfabéticos y espacios.')).toBeInTheDocument();
      expect(screen.getByText('Primer apellido no válido. Solo se permiten caracteres alfabéticos y espacios.')).toBeInTheDocument();
    });

    expect(authService.updateUser).not.toHaveBeenCalled();
  });

  test('Modifica usuario correctamente con datos válidos', async () => {
    await setup();

    const usuarioValido = {
      ...mockUsuario,
      nombre: 'Juan',
      primerApellido: 'Pérez',
      segundoApellido: 'Gómez',
      fechaNacimiento: '1990-01-01',
      nivel: "Nivel I Pista",
      clubVinculadoId: '1',
      licencia: '12345',
      email: 'juan@example.com',
      esAdmin: true,
    };

    // Completar campos
    await userEvent.clear(screen.getByLabelText(/Nombre/i));
    await userEvent.type(screen.getByLabelText(/Nombre/i), usuarioValido.nombre);

    await userEvent.clear(screen.getByLabelText(/Primer Apellido/i));
    await userEvent.type(screen.getByLabelText(/Primer Apellido/i), usuarioValido.primerApellido);

    await userEvent.clear(screen.getByLabelText(/Segundo Apellido/i));
    await userEvent.type(screen.getByLabelText(/Segundo Apellido/i), usuarioValido.segundoApellido);

    await userEvent.clear(screen.getByLabelText(/Fecha de Nacimiento/i));
    await userEvent.type(screen.getByLabelText(/Fecha de Nacimiento/i), usuarioValido.fechaNacimiento);

    // Selección nivel
    await userEvent.click(screen.getByLabelText(/Nivel/i));
    await userEvent.click(screen.getByText(usuarioValido.nivel));

    // Selección club
    await userEvent.click(screen.getByLabelText(/Club Vinculado/i));
    await userEvent.click(screen.getByText('Club A'));

    await userEvent.clear(screen.getByLabelText(/Correo Electrónico/i));
    await userEvent.type(screen.getByLabelText(/Correo Electrónico/i), usuarioValido.email);

    await userEvent.clear(screen.getByLabelText(/Licencia/i));
    await userEvent.type(screen.getByLabelText(/Licencia/i), usuarioValido.licencia);

    await userEvent.clear(screen.getByLabelText(/Código Postal/i));
    await userEvent.type(screen.getByLabelText(/Código Postal/i), usuarioValido.codigoPostal);

    await userEvent.clear(screen.getByLabelText(/Dirección/i));
    await userEvent.type(screen.getByLabelText(/Dirección/i), usuarioValido.direccion);

    await userEvent.clear(screen.getByLabelText(/País/i));
    await userEvent.type(screen.getByLabelText(/País/i), usuarioValido.pais);

    await userEvent.clear(screen.getByLabelText(/Provincia/i));
    await userEvent.type(screen.getByLabelText(/Provincia/i), usuarioValido.region);

    await userEvent.clear(screen.getByLabelText(/Municipio/i));
    await userEvent.type(screen.getByLabelText(/Municipio/i), usuarioValido.ciudad);

    // Cambiar rol de administrador
    if (usuarioValido.esAdmin) {
      await userEvent.click(screen.getByLabelText(/Asignar rol de Administrador/i));
    }

    (authService.updateUser as jest.Mock).mockResolvedValueOnce({ data: 'ok' });

    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(authService.updateUser).toHaveBeenCalledWith(expect.objectContaining({
        id: usuarioValido.id,
        nombre: usuarioValido.nombre,
        primerApellido: usuarioValido.primerApellido,
        email: usuarioValido.email,
        esAdmin: usuarioValido.esAdmin,
      }));

      expect(mockedOnUpdate).toHaveBeenCalled();
      expect(mockedNavigate).toHaveBeenCalledWith('/gestionUsuarios/usuariosView');

      const { toast } = require('react-toastify');
      expect(toast.success).toHaveBeenCalledWith('Usuario actualizado con éxito');
    });
  }, 20000);

  test('Cancela la modificación al hacer clic en Cancelar', async () => {
    await setup();

    await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(mockedNavigate).toHaveBeenCalledWith('/gestionUsuarios/usuariosView');
  });
});
