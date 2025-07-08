import { render, screen } from '@testing-library/react';
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
  beforeEach(() => {
    jest.clearAllMocks();

    const fechaFutura = moment().add(1, 'day').format('YYYY-MM-DD');

    (partidosService.getPartidosByUserId as jest.Mock).mockResolvedValue([
      {
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
      },
    ]);
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

  // No tiene ninguna designacion el usuario
  it('muestra el mensaje de historial vacío si no hay designaciones', async () => {
    (partidosService.getPartidosByUserId as jest.Mock).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <DesignacionesView />
      </BrowserRouter>
    );

    expect(await screen.findByText(/No tienes partidos designados./i)).toBeInTheDocument();
  });
});
