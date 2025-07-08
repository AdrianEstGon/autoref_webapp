import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

const setup = async () => {
  localStorage.setItem('userId', '1');
  (userService.getUsuarioById as jest.Mock).mockResolvedValue(mockUserData);
  (clubService.getClubById as jest.Mock).mockResolvedValue(mockClubData);

  render(
    <BrowserRouter>
      <PerfilView />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(userService.getUsuarioById).toHaveBeenCalledWith('1');
    expect(clubService.getClubById).toHaveBeenCalledWith('10');
  });
};

describe('PerfilView - Visualizar datos personales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Muestra los datos del perfil correctamente', async () => {
    await setup();

    // Validar datos del formulario
    expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
    expect(screen.getByDisplayValue('García')).toBeInTheDocument();
    expect(screen.getByDisplayValue('López')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20-05-1985')).toBeInTheDocument(); 
    expect(screen.getByDisplayValue('Calle Falsa 123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('España')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Asturias')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Gijon')).toBeInTheDocument();
    expect(screen.getByDisplayValue('28001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Nivel I Pista')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Club de Pádel Central')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ana@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('987654')).toBeInTheDocument();

    // Validar imagen
    const profileImage = screen.getByRole('img');
    expect(profileImage).toHaveAttribute('src', mockUserData.fotoPerfil);
  });
});
