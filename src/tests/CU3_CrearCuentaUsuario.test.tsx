import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CrearUsuario from '../app/components/gestion_usuarios/CrearUsuario';
import { BrowserRouter } from 'react-router-dom';
import authService from '../app/services/UserService';
import clubsService from '../app/services/ClubService';

const mockedNavigate = jest.fn();
const mockedOnClose = jest.fn();
const mockedOnSave = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// CORRECTO: Mock para react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div />,
}));

jest.mock('../app/services/UserService', () => ({
  register: jest.fn(),
}));

jest.mock('../app/services/ClubService', () => ({
  getClubs: jest.fn(),
}));

const setup = async () => {
  (clubsService.getClubs as jest.Mock).mockResolvedValue([
    { id: '1', nombre: 'Club A' },
  ]);

  render(
    <BrowserRouter>
      <CrearUsuario open={true} onClose={mockedOnClose} onSave={mockedOnSave} />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(clubsService.getClubs).toHaveBeenCalled();
  });
};

describe('CrearUsuario Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  jest.setTimeout(100000);

  test('Campos vacíos disparan mensajes de validación', async () => {
    await setup();

    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(screen.getByText('Nombre no válido. Solo se permiten caracteres alfabéticos y espacios.')).toBeInTheDocument();
      expect(screen.getByText('Primer apellido no válido. Solo se permiten caracteres alfabéticos y espacios.')).toBeInTheDocument();
      expect(screen.getByText('Segundo apellido no válido. Solo se permiten caracteres alfabéticos y espacios.')).toBeInTheDocument();
      expect(screen.getByText('Debe ingresar una fecha de nacimiento.')).toBeInTheDocument();
      expect(screen.getByText('Debe seleccionar un nivel.')).toBeInTheDocument();
      expect(screen.getByText('Número de licencia no válido. Debe ser un número positivo.')).toBeInTheDocument();
      expect(screen.getByText('Correo electrónico no válido.')).toBeInTheDocument();
      expect(screen.getByText('Código postal no válido. Debe tener exactamente 5 dígitos.')).toBeInTheDocument();
      expect(screen.getByText('Debe ingresar una dirección.')).toBeInTheDocument();
      expect(screen.getByText('Debe ingresar un país.')).toBeInTheDocument();
      expect(screen.getByText('Debe ingresar una región.')).toBeInTheDocument();
      expect(screen.getByText('Debe ingresar una ciudad.')).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
  });

  test('Crea un usuario correctamente con datos válidos', async () => {
    await setup();

    const usuarioValido = {
      nombre: 'Juan',
      primerApellido: 'Pérez',
      segundoApellido: 'Gómez',
      fechaNacimiento: '1990-01-01',
      nivel: "Nivel I Pista",
      clubVinculadoId: '1',
      licencia: '12345',
      email: 'juan@example.com',
      username: 'juan@example.com',
      password: '',
      direccion: 'Calle Falsa 123',
      pais: 'España',
      region: 'Madrid',
      ciudad: 'Madrid',
      codigoPostal: '28080',
      esAdmin: true,
    };

    // Llenamos los campos
    await userEvent.type(screen.getByLabelText(/Nombre/i), usuarioValido.nombre);
    await userEvent.type(screen.getByLabelText(/Primer Apellido/i), usuarioValido.primerApellido);
    await userEvent.type(screen.getByLabelText(/Segundo Apellido/i), usuarioValido.segundoApellido);
    await userEvent.type(screen.getByLabelText(/Fecha de Nacimiento/i), usuarioValido.fechaNacimiento);

    await userEvent.click(screen.getByLabelText(/Nivel/i));
    await userEvent.click(screen.getByText(usuarioValido.nivel));

    await userEvent.click(screen.getByLabelText(/Club Vinculado/i));
    await userEvent.click(screen.getByText('Club A'));

    await userEvent.type(screen.getByLabelText(/Correo Electrónico/i), usuarioValido.email);
    await userEvent.type(screen.getByLabelText(/Licencia/i), usuarioValido.licencia);
    await userEvent.type(screen.getByLabelText(/Código Postal/i), usuarioValido.codigoPostal);
    await userEvent.type(screen.getByLabelText(/Dirección/i), usuarioValido.direccion);
    await userEvent.type(screen.getByLabelText(/País/i), usuarioValido.pais);
    await userEvent.type(screen.getByLabelText(/Provincia/i), usuarioValido.region);
    await userEvent.type(screen.getByLabelText(/Municipio/i), usuarioValido.ciudad);

    await userEvent.click(screen.getByLabelText(/Asignar rol de Administrador/i));

    // Mock del servicio register
    (authService.register as jest.Mock).mockResolvedValueOnce({ data: 'ok' });

    // Click en guardar
    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        ...usuarioValido,
      });

      expect(mockedNavigate).toHaveBeenCalledWith('/gestionUsuarios/usuariosView');

      // Verificar que toast.success se llamó con el mensaje correcto
      const { toast } = require('react-toastify');
      expect(toast.success).toHaveBeenCalledWith('Usuario registrado con éxito');
    });
  });
    test('Cierra el cuadro de diálogo al hacer clic en Cancelar', async () => {
        await setup();
    
        await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    
        expect(mockedOnClose).toHaveBeenCalled();
    });

    test('No crea usuario si el correo electrónico ya está registrado', async () => {
        await setup();

        const usuarioDuplicadoEmail = {
            nombre: 'Ana',
            primerApellido: 'López',
            segundoApellido: 'Sánchez',
            fechaNacimiento: '1992-05-15',
            nivel: "Nivel I Pista",
            clubVinculadoId: '1',
            licencia: '12345',
            email: 'duplicado@example.com',
            username: 'duplicado@example.com',
            password: '',
            direccion: 'Calle Real 456',
            pais: 'España',
            region: 'Sevilla',
            ciudad: 'Sevilla',
            codigoPostal: '41001',
            esAdmin: false,
        };

        // Llenar el formulario
        await userEvent.type(screen.getByLabelText(/Nombre/i), usuarioDuplicadoEmail.nombre);
        await userEvent.type(screen.getByLabelText(/Primer Apellido/i), usuarioDuplicadoEmail.primerApellido);
        await userEvent.type(screen.getByLabelText(/Segundo Apellido/i), usuarioDuplicadoEmail.segundoApellido);
        await userEvent.type(screen.getByLabelText(/Fecha de Nacimiento/i), usuarioDuplicadoEmail.fechaNacimiento);
        await userEvent.click(screen.getByLabelText(/Nivel/i));
        await userEvent.click(screen.getByText(usuarioDuplicadoEmail.nivel));
        await userEvent.click(screen.getByLabelText(/Club Vinculado/i));
        await userEvent.click(screen.getByText('Club A'));
        await userEvent.type(screen.getByLabelText(/Correo Electrónico/i), usuarioDuplicadoEmail.email);
        await userEvent.type(screen.getByLabelText(/Licencia/i), usuarioDuplicadoEmail.licencia);
        await userEvent.type(screen.getByLabelText(/Código Postal/i), usuarioDuplicadoEmail.codigoPostal);
        await userEvent.type(screen.getByLabelText(/Dirección/i), usuarioDuplicadoEmail.direccion);
        await userEvent.type(screen.getByLabelText(/País/i), usuarioDuplicadoEmail.pais);
        await userEvent.type(screen.getByLabelText(/Provincia/i), usuarioDuplicadoEmail.region);
        await userEvent.type(screen.getByLabelText(/Municipio/i), usuarioDuplicadoEmail.ciudad);

        (authService.register as jest.Mock).mockRejectedValueOnce({
            message: 'Error: El correo electrónico ya está registrado',
        });

        await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

        await waitFor(() => {
            const { toast } = require('react-toastify');
            expect(toast.error).toHaveBeenCalledWith('Error: El correo electrónico ya está registrado');
            expect(mockedNavigate).not.toHaveBeenCalled();
        });
    });
    test('No crea usuario si el número de licencia ya está registrado', async () => {
        await setup();

        const usuarioDuplicadoLicencia = {
            nombre: 'Luis',
            primerApellido: 'Martínez',
            segundoApellido: 'Ruiz',
            fechaNacimiento: '1985-03-10',
            nivel: "Nivel II Pista",
            clubVinculadoId: '1',
            licencia: '88888',
            email: 'luis@example.com',
            username: 'luis@example.com',
            password: '',
            direccion: 'Calle Sol 123',
            pais: 'España',
            region: 'Valencia',
            ciudad: 'Valencia',
            codigoPostal: '46001',
            esAdmin: false,
        };

        await userEvent.type(screen.getByLabelText(/Nombre/i), usuarioDuplicadoLicencia.nombre);
        await userEvent.type(screen.getByLabelText(/Primer Apellido/i), usuarioDuplicadoLicencia.primerApellido);
        await userEvent.type(screen.getByLabelText(/Segundo Apellido/i), usuarioDuplicadoLicencia.segundoApellido);
        await userEvent.type(screen.getByLabelText(/Fecha de Nacimiento/i), usuarioDuplicadoLicencia.fechaNacimiento);
        await userEvent.click(screen.getByLabelText(/Nivel/i));
        await userEvent.click(screen.getByText(usuarioDuplicadoLicencia.nivel));
        await userEvent.click(screen.getByLabelText(/Club Vinculado/i));
        await userEvent.click(screen.getByText('Club A'));
        await userEvent.type(screen.getByLabelText(/Correo Electrónico/i), usuarioDuplicadoLicencia.email);
        await userEvent.type(screen.getByLabelText(/Licencia/i), usuarioDuplicadoLicencia.licencia);
        await userEvent.type(screen.getByLabelText(/Código Postal/i), usuarioDuplicadoLicencia.codigoPostal);
        await userEvent.type(screen.getByLabelText(/Dirección/i), usuarioDuplicadoLicencia.direccion);
        await userEvent.type(screen.getByLabelText(/País/i), usuarioDuplicadoLicencia.pais);
        await userEvent.type(screen.getByLabelText(/Provincia/i), usuarioDuplicadoLicencia.region);
        await userEvent.type(screen.getByLabelText(/Municipio/i), usuarioDuplicadoLicencia.ciudad);

        (authService.register as jest.Mock).mockRejectedValueOnce({
            message: 'Error: El número de licencia ya está registrado',
        });

        await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

        await waitFor(() => {
            const { toast } = require('react-toastify');
            expect(toast.error).toHaveBeenCalledWith('Error: El número de licencia ya está registrado');
            expect(mockedNavigate).not.toHaveBeenCalled();
        });
    });


});
