import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../app/components/login/LoginView';
import { BrowserRouter } from 'react-router-dom';
import userService from '../app/services/UserService';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('react-hot-toast', () => ({
  ...jest.requireActual('react-hot-toast'),
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  Toaster: () => <div />,
}));

jest.mock('../app/services/UserService', () => ({
  login: jest.fn(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  test('Los datos introducidos no son correctos', async () => {
    (userService.login as jest.Mock).mockRejectedValueOnce(new Error('Error al iniciar sesión'));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByTestId('password');
    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });

    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(
        'Error al iniciar sesión',
        expect.any(Object)
      );
    });

    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  test('Hay algún campo sin rellenar', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(
        'Falta completar algún campo',
        expect.any(Object)
      );
    });

    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  test('Login exitoso navega a la interfaz principal', async () => {
    const mockUserLogin = {
      message: 'Inicio de sesión exitoso',
      token: 'fake-token-123',
      id: 'user-id-123',
      fotoPerfil: 'url-to-fotoPerfil',
    };

    (userService.login as jest.Mock).mockResolvedValueOnce(mockUserLogin);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByTestId('password');
    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });

    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, '@Correctpassword1');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(require('react-hot-toast').toast.success).toHaveBeenCalledWith(
        'Inicio de sesión exitoso',
        expect.any(Object)
      );
    });

    expect(mockedNavigate).toHaveBeenCalledWith('/misDesignaciones');

    expect(window.localStorage.getItem('authToken')).toBe('fake-token-123');
   const userLoggedString = window.localStorage.getItem('userLogged');
    expect(userLoggedString).not.toBeNull();

    const userLogged = JSON.parse(userLoggedString!);

    expect(userLogged).toEqual(expect.objectContaining({
    message: 'Inicio de sesión exitoso',
    token: 'fake-token-123',
    id: 'user-id-123',
    fotoPerfil: 'url-to-fotoPerfil',
    timestamp: expect.any(String),  
    }));
    expect(window.localStorage.getItem('userId')).toBe('user-id-123');
    expect(window.localStorage.getItem('fotoPerfil')).toBe('url-to-fotoPerfil');
  });
});
