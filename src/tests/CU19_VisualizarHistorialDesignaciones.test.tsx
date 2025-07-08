import { render, screen } from '@testing-library/react';
import HistorialDesignacionesView from '../app/components/designaciones/HistorialDesignacionesView';
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

describe('Historial de Designaciones - Árbitro', () => {
  const fechaPasada = moment().subtract(2, 'days').format('YYYY-MM-DD');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra correctamente los partidos del historial', async () => {
    (partidosService.getPartidosByUserId as jest.Mock).mockResolvedValue([
      {
        id: '1',
        fecha: fechaPasada,
        hora: '10:00:00',
        lugar: 'Pabellón Central',
        categoria: 'Sub 15',
        equipoLocal: 'Equipo A',
        equipoVisitante: 'Equipo B',
        arbitro1: 'Juan Pérez',
        arbitro2: 'Lucía Ramírez',
        anotador: 'Carlos Díaz',
      },
    ]);

    render(
      <BrowserRouter>
        <HistorialDesignacionesView />
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
  });

  it('muestra el mensaje de historial vacío si no hay partidos', async () => {
    (partidosService.getPartidosByUserId as jest.Mock).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <HistorialDesignacionesView />
      </BrowserRouter>
    );

    expect(await screen.findByText(/No tienes partidos arbitrados/i)).toBeInTheDocument();
  });
});
