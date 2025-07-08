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

describe('PerfilView - Modificar Foto de Perfil', () => {
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:mocked-url');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('userId', '1');

    (userService.getUsuarioById as jest.Mock).mockResolvedValue(mockUserData);
    (clubService.getClubById as jest.Mock).mockResolvedValue(mockClubData);
  });

  test('Carga y previsualiza una nueva foto de perfil correctamente', async () => {
    const { container } = render(
      <BrowserRouter>
        <PerfilView />
      </BrowserRouter>
    );

    // Esperar a que se cargue el perfil y el club
    await waitFor(() => {
      expect(userService.getUsuarioById).toHaveBeenCalledWith('1');
      expect(clubService.getClubById).toHaveBeenCalledWith('10');
    });

    // Buscar el input file (está dentro de IconButton con component="label")
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    // Crear un archivo falso
    const fakeImage = new File(['(⌐□_□)'], 'foto-nueva.png', { type: 'image/png' });

    // Simular cambio de archivo (subida)
    fireEvent.change(fileInput as Element, {
      target: { files: [fakeImage] },
    });

    // Esperar a que el servicio de subida se haya llamado
    await waitFor(() => {
      expect(userService.uploadProfilePicture).toHaveBeenCalledWith(fakeImage);
    });

    // Esperar a que la imagen preview se actualice con la URL blob
    await waitFor(() => {
      const updatedImage = screen.getByRole('img') as HTMLImageElement;
      expect(updatedImage.src).toContain('blob:mocked-url');
    });

    // Verificar que se mostró mensaje de éxito
    const { toast } = require('react-toastify');
    expect(toast.success).toHaveBeenCalledWith('Foto de perfil actualizada con éxito');
  });
});
