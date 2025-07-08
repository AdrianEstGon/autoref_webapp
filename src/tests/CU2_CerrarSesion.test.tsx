import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavigationBar from '../app/components/barra_navegacion/NavBar';
import { BrowserRouter } from 'react-router-dom';

describe('NavigationBar - Cerrar sesión', () => {
  // Mocks para silenciar errores y warnings en consola
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
  let consoleWarnSpy: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;

  beforeEach(() => {
    // Silenciar errores y warnings de consola
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Simular usuario logueado en localStorage
    window.localStorage.setItem('userLogged', JSON.stringify({
      id: 'user-id-123',
      token: 'fake-token',
      timestamp: new Date().toISOString(),
    }));
    window.localStorage.setItem('userRole', 'User');
    window.localStorage.setItem('fotoPerfil', 'url-to-fotoPerfil');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();

    // Restaurar consola para otros tests
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('Se muestra opción cerrar sesión y funciona correctamente', async () => {
    // Mock de window.location.href para no recargar realmente la página
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    render(
      <BrowserRouter>
        <NavigationBar />
      </BrowserRouter>
    );

    // Abrir el menú del perfil (botón)
    const perfilButton = screen.getByTitle(/Mi perfil/i);
    await userEvent.click(perfilButton);

    // Buscar el item de menú "Cerrar sesión"
    const cerrarSesionButton = await screen.findByText(/Cerrar sesión/i);
    expect(cerrarSesionButton).toBeInTheDocument();

    // Click en cerrar sesión
    await userEvent.click(cerrarSesionButton);

    // Esperar y verificar que se limpiaron los datos
    expect(window.localStorage.getItem('userLogged')).toBeNull();
    expect(window.localStorage.getItem('userRole')).toBeNull();
    expect(window.localStorage.getItem('fotoPerfil')).toBeNull();

    // Verificar redirección
    expect(window.location.href).toBe('/');
  });
});
