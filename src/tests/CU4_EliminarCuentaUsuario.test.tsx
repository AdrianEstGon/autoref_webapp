import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import UsuariosView from '../app/components/gestion_usuarios/UsuariosView';
import userService from '../app/services/UserService';

// Mocks
jest.mock('../app/services/UserService', () => ({
  getUsuarios: jest.fn(),
  eliminarUsuario: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div />,
}));

const { toast } = require('react-toastify');

const setup = async () => {
  (userService.getUsuarios as jest.Mock).mockResolvedValue([
    {
      id: 1,
      nombre: 'Pedro',
      primerApellido: 'Ramírez',
      segundoApellido: 'López',
      nivel: "Nivel I Pista",
      fechaNacimiento: '1990-01-01',
      clubVinculado: 'Club A',
      email: 'pedro@example.com',
      licencia: 123456,
      codigoPostal: '28001',
      roles: ['Admin'],
    },
  ]);

  render(
    <BrowserRouter>
      <UsuariosView />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(userService.getUsuarios).toHaveBeenCalled();
  });
};

describe('UsuariosView - Eliminar Usuario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Elimina un usuario correctamente', async () => {
    await setup();

    // Simula clic en botón de eliminar
    const deleteButton = await screen.findByTestId('delete-user-button');
    expect(deleteButton).toBeInTheDocument();
    await userEvent.click(deleteButton);

    // Espera y hace clic en botón de confirmación del diálogo
    const confirmButton = await screen.findByRole('button', { name: /eliminar/i });
    await userEvent.click(confirmButton);

    // Mock eliminación exitosa
    (userService.eliminarUsuario as jest.Mock).mockResolvedValue({ data: 'ok' });

    await waitFor(() => {
      expect(userService.eliminarUsuario).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Usuario eliminado correctamente');
    });

  });

  // El usuario no confirma la eliminación
    test('No elimina el usuario si no se confirma', async () => {
        await setup();
    
        // Simula clic en botón de eliminar
        const deleteButton = await screen.findByTestId('delete-user-button');
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton);
    
        // Espera y hace clic en botón de cancelación del diálogo
        const cancelButton = await screen.findByRole('button', { name: /cancelar/i });
        await userEvent.click(cancelButton);
    
        // Verifica que la eliminación no se haya llamado
        expect(userService.eliminarUsuario).not.toHaveBeenCalled();
    });

});
