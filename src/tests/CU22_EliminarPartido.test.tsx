import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PartidosView from '../app/components/gestion_partidos/PartidosView';
import partidosService from '../app/services/PartidoService';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../app/services/PartidoService');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div />, // Simula contenedor de toasts
}));

describe('CU22 - Eliminar Partido', () => {
  const mockPartido = {
    id: 1,
    fecha: '2025-07-15',
    hora: '18:00:00',
    lugar: 'Pabellón A',
    equipoLocal: 'Equipo A',
    equipoVisitante: 'Equipo B',
    categoria: 'Sub 18',
    jornada: 3,
    numeroPartido: 12,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (partidosService.getPartidos as jest.Mock).mockResolvedValue([mockPartido]);
  });

  it('muestra y elimina el partido tras confirmar', async () => {
    (partidosService.eliminarPartido as jest.Mock).mockResolvedValue({});

    render(
      <BrowserRouter>
        <PartidosView />
      </BrowserRouter>
    );

    expect(await screen.findByText('Equipo A')).toBeInTheDocument();
    expect(screen.getByText('Equipo B')).toBeInTheDocument();

    const eliminarBtn = screen.getAllByRole('button', { name: '' })
      .find((btn) => within(btn).queryByTestId('DeleteIcon'));
    expect(eliminarBtn).toBeDefined();
    await userEvent.click(eliminarBtn!);

    // Confirm dialog
    expect(screen.getByText(/¿Estás seguro de que deseas eliminar este partido/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Eliminar/i }));

    await waitFor(() => {
      expect(partidosService.eliminarPartido).toHaveBeenCalledWith(1);
      const { toast } = require('react-toastify');
      expect(toast.success).toHaveBeenCalledWith('Partido eliminado correctamente');
    });

    await waitFor(() => {
      expect(screen.queryByText('Equipo A')).not.toBeInTheDocument();
    });
  });

  it('cancela la eliminación si se pulsa Cancelar', async () => {
    render(
      <BrowserRouter>
        <PartidosView />
      </BrowserRouter>
    );

    expect(await screen.findByText('Equipo A')).toBeInTheDocument();

    const eliminarBtn = screen.getAllByRole('button', { name: '' })
      .find((btn) => within(btn).queryByTestId('DeleteIcon'));
    expect(eliminarBtn).toBeDefined();
    await userEvent.click(eliminarBtn!);

    expect(screen.getByText(/¿Estás seguro de que deseas eliminar este partido/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(partidosService.eliminarPartido).not.toHaveBeenCalled();
    expect(await screen.findByText('Equipo A')).toBeInTheDocument();
  });
});