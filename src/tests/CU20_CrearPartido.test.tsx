import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CrearPartido from '../app/components/gestion_partidos/CrearPartido';
import partidosService from '../app/services/PartidoService';
import polideportivosService from '../app/services/PolideportivoService';
import equiposService from '../app/services/EquipoService';
import categoriasService from '../app/services/CategoriaService';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../app/services/PartidoService');
jest.mock('../app/services/PolideportivoService');
jest.mock('../app/services/EquipoService');
jest.mock('../app/services/CategoriaService');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  ToastContainer: () => <div />,
}));

describe('CrearPartido Component', () => {
  const mockedOnClose = jest.fn();
  const mockedOnSave = jest.fn();

  const setup = async () => {
    (categoriasService.getCategorias as jest.Mock).mockResolvedValue([
      { id: 'cat1', nombre: 'Sub 15' },
    ]);

    (polideportivosService.getPolideportivos as jest.Mock).mockResolvedValue([
      { id: 'poli1', nombre: 'Pabellón Central' },
    ]);

    (equiposService.getEquiposPorCategoria as jest.Mock).mockResolvedValue([
      { id: 'eq1', nombre: 'Equipo A' },
      { id: 'eq2', nombre: 'Equipo B' },
    ]);

    render(
      <BrowserRouter>
        <CrearPartido open={true} onClose={mockedOnClose} onSave={mockedOnSave} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(categoriasService.getCategorias).toHaveBeenCalled();
      expect(polideportivosService.getPolideportivos).toHaveBeenCalled();
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Crea un partido correctamente con datos válidos', async () => {
    await setup();

    await userEvent.click(screen.getByLabelText(/Categoría/i));
    await userEvent.click(await screen.findByText('Sub 15'));

    await waitFor(() => {
      expect(equiposService.getEquiposPorCategoria).toHaveBeenCalledWith('cat1');
    });

    await userEvent.click(screen.getByLabelText(/Equipo Local/i));
    await userEvent.click(screen.getByText('Equipo A'));

    await userEvent.click(screen.getByLabelText(/Equipo Visitante/i));
    await userEvent.click(screen.getByText('Equipo B'));

    await userEvent.type(screen.getByLabelText(/Fecha/i), '2025-06-10');
    await userEvent.type(screen.getByLabelText(/Hora/i), '10:30');

    await userEvent.click(screen.getByLabelText(/Polideportivo/i));
    await userEvent.click(screen.getByText('Pabellón Central'));

    await userEvent.type(screen.getByLabelText(/Jornada/i), '3');
    await userEvent.type(screen.getByLabelText(/Número de Partido/i), '7');

    (partidosService.crearPartido as jest.Mock).mockResolvedValueOnce({});

    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(partidosService.crearPartido).toHaveBeenCalledWith({
        equipoLocalId: 'eq1',
        equipoVisitanteId: 'eq2',
        fecha: '2025-06-10',
        hora: '10:30',
        lugarId: 'poli1',
        categoriaId: 'cat1',
        jornada: '3',
        numeroPartido: '7',
      });
    });
  });

  test('Muestra errores si se envía el formulario vacío', async () => {
    await setup();

    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
        expect(screen.getByText('Debe seleccionarse un equipo local.')).toBeInTheDocument();
        expect(screen.getByText('Debe seleccionarse un equipo visitante.')).toBeInTheDocument();
        expect(screen.getByText('Debe selecionarse una fecha.')).toBeInTheDocument();
        expect(screen.getByText('Debe seleccionarse una hora.')).toBeInTheDocument();
        expect(screen.getByText('Debe seleccionarse un polideportivo.')).toBeInTheDocument();
        expect(screen.getByText('La categoría no es válida.')).toBeInTheDocument();
        expect(screen.getByText('El número de jornada debe ser positivo.')).toBeInTheDocument();
        expect(screen.getByText('El número de partido debe ser positivo.')).toBeInTheDocument();
        });


    expect(partidosService.crearPartido).not.toHaveBeenCalled();
  });
});
