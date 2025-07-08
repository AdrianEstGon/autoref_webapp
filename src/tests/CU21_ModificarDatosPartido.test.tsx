import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModificarPartido from '../app/components/gestion_partidos/ModificarPartido';
import { BrowserRouter } from 'react-router-dom';
import partidosService from '../app/services/PartidoService';
import polideportivosService from '../app/services/PolideportivoService';
import equiposService from '../app/services/EquipoService';
import categoriasService from '../app/services/CategoriaService';

const mockedNavigate = jest.fn();
const mockedOnClose = jest.fn();
const mockedOnUpdate = jest.fn();

const mockPartido = {
  id: '1',
  fecha: '2025-06-01',
  hora: '10:00',
  lugarId: '101',
  categoriaId: '201',
  equipoLocalId: '301',
  equipoVisitanteId: '302',
  jornada: '1',
  numeroPartido: '1001'
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({
    state: { partido: mockPartido }
  }),
}));

jest.mock('../app/services/PartidoService', () => ({
  actualizarPartido: jest.fn(),
}));

jest.mock('../app/services/PolideportivoService', () => ({
  getPolideportivos: jest.fn(),
}));

jest.mock('../app/services/EquipoService', () => ({
  getEquiposPorCategoria: jest.fn(),
}));

jest.mock('../app/services/CategoriaService', () => ({
  getCategorias: jest.fn(),
}));

describe('ModificarPartido Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = async () => {
    (categoriasService.getCategorias as jest.Mock).mockResolvedValue([{ id: '201', nombre: 'Sub 15' }]);
    (polideportivosService.getPolideportivos as jest.Mock).mockResolvedValue([{ id: '101', nombre: 'Pabellón Central' }]);
    (equiposService.getEquiposPorCategoria as jest.Mock).mockResolvedValue([
      { id: '301', nombre: 'Equipo A' },
      { id: '302', nombre: 'Equipo B' },
    ]);

    render(
      <BrowserRouter>
        <ModificarPartido open={true} onClose={mockedOnClose} onUpdate={mockedOnUpdate} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(categoriasService.getCategorias).toHaveBeenCalled();
    });
  };

  test('Carga correctamente los datos del partido a modificar', async () => {
    await setup();

    expect(screen.getByDisplayValue('2025-06-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1001')).toBeInTheDocument();
  });

  test('Guarda el partido correctamente con datos válidos', async () => {
    await setup();

    await userEvent.clear(screen.getByLabelText(/Número de Partido/i));
    await userEvent.type(screen.getByLabelText(/Número de Partido/i), '2002');

    (partidosService.actualizarPartido as jest.Mock).mockResolvedValueOnce({});

    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(partidosService.actualizarPartido).toHaveBeenCalledWith(expect.objectContaining({
        numeroPartido: '2002',
      }));
      expect(mockedOnUpdate).toHaveBeenCalled();
      expect(mockedNavigate).toHaveBeenCalledWith('/gestionPartidos/partidosView');
    });
  });

  // Modifica todos los campos del partido
  test('Modifica todos los campos del partido y guarda correctamente', async () => {
    await setup();

    await userEvent.clear(screen.getByLabelText(/Fecha/i));
    await userEvent.type(screen.getByLabelText(/Fecha/i), '2025-06-15');

    await userEvent.clear(screen.getByLabelText(/Hora/i));
    await userEvent.type(screen.getByLabelText(/Hora/i), '12:00');

    await userEvent.click(screen.getByLabelText(/Categoría/i));
    await userEvent.click(await screen.findByText('Sub 15'));

    await userEvent.click(screen.getByLabelText(/Equipo Local/i));
    await userEvent.click(await screen.findByText('Equipo A'));

    await userEvent.click(screen.getByLabelText(/Equipo Visitante/i));
    await userEvent.click(await screen.findByText('Equipo B'));

    await userEvent.clear(screen.getByLabelText(/Jornada/i));
    await userEvent.type(screen.getByLabelText(/Jornada/i), '2');

    (partidosService.actualizarPartido as jest.Mock).mockResolvedValueOnce({});

    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(partidosService.actualizarPartido).toHaveBeenCalledWith(expect.objectContaining({
        fecha: '2025-06-15',
        hora: '12:00',
        jornada: '2',
      }));
      expect(mockedOnUpdate).toHaveBeenCalled();
      expect(mockedNavigate).toHaveBeenCalledWith('/gestionPartidos/partidosView');
    });
  });

  test('Al hacer clic en Cancelar se navega a la vista de partidos', async () => {
    await setup();

    await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(mockedNavigate).toHaveBeenCalledWith('/gestionPartidos/partidosView');
  });
});
