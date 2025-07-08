import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PerfilView from '../app/components/perfil/PerfilView';
import userService from '../app/services/UserService';
import clubService from '../app/services/ClubService';
import { BrowserRouter } from 'react-router-dom';

// Mocks
jest.mock('../app/services/UserService', () => ({
  getUsuarioById: jest.fn(),
  uploadProfilePicture: jest.fn(),
  changePassword: jest.fn(),
}));

jest.mock('../app/services/ClubService', () => ({
  getClubById: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div />,
}));

const mockUserData = {
  fotoPerfil: 'https://via.placeholder.com/150',
  nombre: 'Ana',
  primerApellido: 'García',
  segundoApellido: 'López',
  fechaNacimiento: '1985-05-20',
  direccion: 'Calle Falsa 123',
  pais: 'España',
  region: 'Asturias',
  ciudad: 'Gijon',
  codigoPostal: '28001',
  nivel: 'Nivel I Pista',
  clubVinculadoId: '10',
  email: 'ana@example.com',
  licencia: '987654',
};

const mockClubData = {
  nombre: 'Club de Pádel Central',
};

describe('PerfilView - Modificar Contraseña', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('userId', '1');

    (userService.getUsuarioById as jest.Mock).mockResolvedValue(mockUserData);
    (clubService.getClubById as jest.Mock).mockResolvedValue(mockClubData);
  });

  test('Modifica contraseña exitosamente', async () => {
    (userService.changePassword as jest.Mock).mockResolvedValue({ status: 200 });

    render(
      <BrowserRouter>
        <PerfilView />
      </BrowserRouter>
    );

    // Esperar que cargue el perfil
    await waitFor(() => expect(userService.getUsuarioById).toHaveBeenCalled());

    // Abrir diálogo de modificar contraseña
    fireEvent.click(screen.getByRole('button', { name: /modificar contraseña/i }));

    // Completar formulario
    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i), { target: { value: 'NewPass123!' } });
    fireEvent.change(screen.getByLabelText(/confirmar nueva contraseña/i), { target: { value: 'NewPass123!' } });

    // Guardar
    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(userService.changePassword).toHaveBeenCalledWith({
        OldPassword: 'OldPass123!',
        NewPassword: 'NewPass123!',
      });
    });

    const { toast } = require('react-toastify');
    expect(toast.success).toHaveBeenCalledWith('Contraseña actualizada con éxito');
  });

  test('Error si las nuevas contraseñas no coinciden', async () => {
    render(
      <BrowserRouter>
        <PerfilView />
      </BrowserRouter>
    );

    await waitFor(() => expect(userService.getUsuarioById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /modificar contraseña/i }));

    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i), { target: { value: 'NewPass123!' } });
    fireEvent.change(screen.getByLabelText(/confirmar nueva contraseña/i), { target: { value: 'Different123!' } });

    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));

    expect(await screen.findByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    expect(userService.changePassword).not.toHaveBeenCalled();
  });

  test('Error si la nueva contraseña no cumple criterios de seguridad', async () => {
    render(
      <BrowserRouter>
        <PerfilView />
      </BrowserRouter>
    );

    await waitFor(() => expect(userService.getUsuarioById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /modificar contraseña/i }));

    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i), { target: { value: 'short' } }); 
    fireEvent.change(screen.getByLabelText(/confirmar nueva contraseña/i), { target: { value: 'short' } });

    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));

    expect(await screen.findByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
    expect(userService.changePassword).not.toHaveBeenCalled();
  });

  test('Error si la contraseña actual es incorrecta', async () => {
    (userService.changePassword as jest.Mock).mockRejectedValue(new Error("La contraseña actual no es correcta"));

    render(
      <BrowserRouter>
        <PerfilView />
      </BrowserRouter>
    );

    await waitFor(() => expect(userService.getUsuarioById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /modificar contraseña/i }));

    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: 'WrongOldPass123!' } });
    fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i), { target: { value: 'NewPass123!' } });
    fireEvent.change(screen.getByLabelText(/confirmar nueva contraseña/i), { target: { value: 'NewPass123!' } });

    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(userService.changePassword).toHaveBeenCalled();
    });

    expect(await screen.findByText(/la contraseña actual es incorrecta/i)).toBeInTheDocument();
  });
});
