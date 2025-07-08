// src/tests/CU12_VisualizarPartidos.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PartidosView from '../app/components/gestion_partidos/PartidosView';
import partidosService from '../app/services/PartidoService';

jest.mock('../app/services/PartidoService', () => ({
  getPartidos: jest.fn(),
  eliminarPartido: jest.fn(),
  crearPartido: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
  ToastContainer: () => <div/>
}));

describe('PartidosView – tabla y múltiples datos', () => {
  const MULTIPLE_PARTIDOS = [
    {
      id: 42,
      fecha: '2024-07-15',
      hora: '14:00',
      lugar: 'Cancha X',
      equipoLocal: 'Local FC',
      equipoVisitante: 'Visitantes United',
      categoria: 'Senior',
      jornada: 7,
      numeroPartido: 200
    },
    {
      id: 43,
      fecha: '2024-07-16',
      hora: '16:30',
      lugar: 'Cancha Y',
      equipoLocal: 'Equipo Alpha',
      equipoVisitante: 'Equipo Beta',
      categoria: 'Junior',
      jornada: 8,
      numeroPartido: 201
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (partidosService.getPartidos as jest.Mock).mockResolvedValue(MULTIPLE_PARTIDOS);
  });

  it('Se cargan los partidos correctamente', async () => {
    render(
      <BrowserRouter>
        <PartidosView />
      </BrowserRouter>
    );

    // Esperamos a que getPartidos haya sido invocado
    await waitFor(() => expect(partidosService.getPartidos).toHaveBeenCalled());

    // Verificamos el título y las cabeceras
    expect(screen.getByText('Gestión de Partidos')).toBeInTheDocument();
    ['Fecha','Hora','Lugar','Equipo Local','Equipo Visitante','Categoría','Jornada','Acciones']
      .forEach(header => expect(screen.getByText(header)).toBeInTheDocument());

    // Esperamos filas de datos
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // título, cabecera, + dos partidos = al menos 4 filas
      expect(rows.length).toBeGreaterThanOrEqual(4);
    });

    const rows = screen.getAllByRole('row');

    // Primera fila de datos (rows[2])
    expect(rows[2]).toHaveTextContent('15-07-2024');
    expect(rows[2]).toHaveTextContent('14:00');
    expect(rows[2]).toHaveTextContent('Cancha X');
    expect(rows[2]).toHaveTextContent('Local FC');
    expect(rows[2]).toHaveTextContent('Visitantes United');
    expect(rows[2]).toHaveTextContent('Senior');
    expect(rows[2]).toHaveTextContent('7');

    // Segunda fila de datos (rows[3])
    expect(rows[3]).toHaveTextContent('16-07-2024');
    expect(rows[3]).toHaveTextContent('16:30');
    expect(rows[3]).toHaveTextContent('Cancha Y');
    expect(rows[3]).toHaveTextContent('Equipo Alpha');
    expect(rows[3]).toHaveTextContent('Equipo Beta');
    expect(rows[3]).toHaveTextContent('Junior');
    expect(rows[3]).toHaveTextContent('8');
  });
});
