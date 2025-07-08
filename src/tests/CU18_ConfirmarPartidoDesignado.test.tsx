import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DesignacionesView from '../app/components/designaciones/DesignacionesView';
import partidosService from '../app/services/PartidoService';
import { BrowserRouter } from 'react-router-dom';
import moment from 'moment';

jest.mock('../app/services/PartidoService');

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => {
        if (key === 'userLogged') {
          return JSON.stringify({ id: 'u1', nombre: 'Juan', rol: 'arbitro' });
        }
        if (key === 'userId') {
          return 'u1';
        }
        return null;
      },
    },
    writable: true,
  });
});

describe('Mis Designaciones - Árbitro', () => {
  const fechaFutura = moment().add(1, 'day').format('YYYY-MM-DD');

  let mockPartido: any;

  beforeEach(() => {
    mockPartido = {
      id: '1',
      fecha: fechaFutura,
      hora: '10:00:00',
      lugar: 'Pabellón Central',
      categoria: 'Sub 15',
      equipoLocal: 'Equipo A',
      equipoVisitante: 'Equipo B',
      arbitro1: 'Juan Pérez',
      arbitro2: 'Lucía Ramírez',
      anotador: 'Carlos Díaz',
      arbitro1Id: 'u1',
      arbitro2Id: 'u2',
      anotadorId: 'u3',
      estadoArbitro1: 0,
      estadoArbitro2: 0,
      estadoAnotador: 0,
    };

    jest.clearAllMocks();
    (partidosService.getPartidosByUserId as jest.Mock).mockResolvedValue([mockPartido]);
    (partidosService.actualizarPartido as jest.Mock).mockImplementation((updatedPartido) => {
      mockPartido = updatedPartido;
      return Promise.resolve(updatedPartido);
    });
  });

  it('muestra correctamente las designaciones y los botones de aceptar/rechazar', async () => {
    render(
      <BrowserRouter>
        <DesignacionesView />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Equipo A - Equipo B/i)).toBeInTheDocument();
    expect(screen.getByText(/Pabellón Central/i)).toBeInTheDocument();
    expect(screen.getByText(/Sub 15/i)).toBeInTheDocument();

    expect(
      screen.getAllByText((_, node) => node?.textContent === 'Árbitro 1: Juan Pérez')[0]
    ).toBeInTheDocument();

    expect(
      screen.getAllByText((_, node) => node?.textContent === 'Árbitro 2: Lucía Ramírez')[0]
    ).toBeInTheDocument();

    expect(
      screen.getAllByText((_, node) => node?.textContent === 'Anotador: Carlos Díaz')[0]
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Aceptar designación/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rechazar designación/i })).toBeInTheDocument();
  });

  it('confirma la designación al aceptar y muestra "Aceptado"', async () => {
    render(
      <BrowserRouter>
        <DesignacionesView />
      </BrowserRouter>
    );

    const aceptarBtn = await screen.findByRole('button', { name: /Aceptar designación/i });
    fireEvent.click(aceptarBtn);

    expect(await screen.findByText(/¿Estás seguro de que deseas aceptar esta designación/i)).toBeInTheDocument();

    const confirmarBtn = screen.getByRole('button', { name: /Confirmar/i });
    fireEvent.click(confirmarBtn);

    await waitFor(() => {
      expect(partidosService.actualizarPartido).toHaveBeenCalled();
    });
    //El estado del árbitro 1 debería cambiar a 1 (aceptado)
    expect(mockPartido.estadoArbitro1).toBe(1);

    expect(await screen.findByText('Aceptado')).toBeInTheDocument();
  });

  it('confirma la designación al rechazar y muestra "Rechazado"', async () => {
    render(
      <BrowserRouter>
        <DesignacionesView />
      </BrowserRouter>
    );

    const rechazarBtn = await screen.findByRole('button', { name: /Rechazar designación/i });
    fireEvent.click(rechazarBtn);

    expect(await screen.findByText(/¿Estás seguro de que deseas rechazar esta designación/i)).toBeInTheDocument();

    const confirmarBtn = screen.getByRole('button', { name: /Confirmar/i });
    fireEvent.click(confirmarBtn);

    await waitFor(() => {
      expect(partidosService.actualizarPartido).toHaveBeenCalled();
    });
    //El estado del árbitro 1 debería cambiar a 2 (rechazado)
    expect(mockPartido.estadoArbitro1).toBe(2);

    expect(await screen.findByText('Rechazado')).toBeInTheDocument();
  });
});
