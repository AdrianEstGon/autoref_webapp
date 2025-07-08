import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DesignacionesView from '../app/components/gestion_designaciones/PanelDesignacionesView';
import { BrowserRouter } from 'react-router-dom';
import PartidoService from '../app/services/PartidoService';
import UserService from '../app/services/UserService';
import CategoriaService from '../app/services/CategoriaService';
import LugarService from '../app/services/PolideportivoService';
import DisponibilidadService from '../app/services/DisponibilidadService';
import EquipoService from '../app/services/EquipoService';
import dayjs from 'dayjs';
import moment from 'moment';
import { seleccionarOpcionAutocomplete } from '../tests/utils/AutocompleteHelper';

jest.mock('../app/services/EquipoService');
jest.mock('../app/services/DisponibilidadService');
jest.mock('../app/services/PolideportivoService');
jest.mock('../app/services/CategoriaService');
jest.mock('../app/services/PartidoService');
jest.mock('../app/services/UserService');

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
  ToastContainer: () => <div />
}));

beforeEach(() => {
  localStorage.setItem('token', 'fake-valid-token');
  jest.clearAllMocks();
});

const lugaresMock = [
  { id: 1, nombre: 'Polideportivo Norte' },
  { id: 2, nombre: 'Polideportivo Sur' },
];

const equiposMock = [
  { id: 1, nombre: 'Tigres' },
  { id: 2, nombre: 'Leones' },
  { id: 3, nombre: 'Águilas' },
  { id: 4, nombre: 'Halcones' },
  { id: 5, nombre: 'Búhos' },
  { id: 6, nombre: 'Gatos' },
  { id: 7, nombre: 'Perros' },
  { id: 8, nombre: 'Lobos' },
  { id: 9, nombre: 'Osos' },
  { id: 10, nombre: 'Zorros' },
];

const categoriasMock = [
  { id: 1, nombre: 'U18' },
  { id: 2, nombre: 'U21' },
];

const disponibilidadesMock = [
  { id: 1, userId: 101, fecha: '2025-05-22', disponible: true },
  { id: 2, userId: 102, fecha: '2025-05-25', disponible: false },
];

const partidosMock = [
  {
    id: 1,
    fecha: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    hora: '10:00:00',
    lugar: 'Polideportivo Norte',
    equipoLocal: 'Tigres',
    equipoVisitante: 'Leones',
    categoria: 'U18',
  },
  {
    id: 2,
    fecha: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    hora: '12:00:00',
    lugar: 'Polideportivo Sur',
    equipoLocal: 'Águilas',
    equipoVisitante: 'Halcones',
    categoria: 'U21',
  },
  {
    id: 3,
    fecha: dayjs().add(8, 'day').format('YYYY-MM-DD'),
    hora: '14:00:00',
    lugar: 'Polideportivo Norte',
    equipoLocal: 'Búhos',
    equipoVisitante: 'Gatos',
    categoria: 'U18',
  },
  {
    id: 4,
    fecha: dayjs().add(9, 'day').format('YYYY-MM-DD'),
    hora: '16:00:00',
    lugar: 'Polideportivo Sur',
    equipoLocal: 'Perros',
    equipoVisitante: 'Lobos',
    categoria: 'U21',
  },
  {
    id: 5,
    fecha: dayjs().add(10, 'day').format('YYYY-MM-DD'),
    hora: '18:00:00',
    lugar: 'Polideportivo Norte',
    equipoLocal: 'Osos',
    equipoVisitante: 'Zorros',
    categoria: 'U18',
  },
  {
    id: 6,
    fecha: dayjs().add(11, 'day').format('YYYY-MM-DD'),
    hora: '20:00:00',
    lugar: 'Polideportivo Sur',
    equipoLocal: 'Tigres',
    equipoVisitante: 'Zorros',
    categoria: 'U21',
  },
];

const mockedEquipoService = EquipoService as jest.Mocked<typeof EquipoService>;
mockedEquipoService.getEquipos.mockResolvedValue(equiposMock);

const mockedCategoriaService = CategoriaService as jest.Mocked<typeof CategoriaService>;
mockedCategoriaService.getCategorias.mockResolvedValue(categoriasMock);

const mockedLugarService = LugarService as jest.Mocked<typeof LugarService>;
mockedLugarService.getPolideportivos.mockResolvedValue(lugaresMock);

const mockedDisponibilidadService = DisponibilidadService as jest.Mocked<typeof DisponibilidadService>;
mockedDisponibilidadService.getDisponibilidades.mockResolvedValue(disponibilidadesMock);

const mockedUserService = UserService as jest.Mocked<typeof UserService>;
mockedUserService.getUsuarios.mockResolvedValue([]);

describe('Carga inicial de partidos', () => {
  beforeEach(() => {
    const mockedPartidoService = PartidoService as jest.Mocked<typeof PartidoService>;
    mockedPartidoService.getPartidos.mockResolvedValue(partidosMock);
  });

  it('muestra los partidos de los próximos 7 días por defecto', async () => {
    render(
      <BrowserRouter>
        <DesignacionesView />
      </BrowserRouter>
    );

    // Partidos que deberían aparecer
    expect(await screen.findByText(/Tigres - Leones/)).toBeInTheDocument();
    expect(screen.getByText(/Águilas - Halcones/)).toBeInTheDocument();

    // Partidos que no deberían aparecer
    expect(screen.queryByText(/Búhos - Gatos/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Perros - Lobos/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Osos - Zorros/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tigres - Zorros/)).not.toBeInTheDocument();
  });


it('muestra los partidos del Polideportivo Sur tras aplicar el filtro', async () => {
  render(
    <BrowserRouter>
      <DesignacionesView />
    </BrowserRouter>
  );
    const hoy = moment();
    const en30Dias = moment().add(30, 'days');

    const fechaInicioInput = await screen.findByLabelText(/Fecha Inicio/);
    fireEvent.change(fechaInicioInput, { target: { value: hoy.format('DD/MM/YYYY') } });
    fireEvent.blur(fechaInicioInput);

    const fechaFinInput = await screen.findByLabelText(/Fecha Fin/);
    fireEvent.change(fechaFinInput, { target: { value: en30Dias.format('DD/MM/YYYY') } });
    fireEvent.blur(fechaFinInput);


  await seleccionarOpcionAutocomplete(/Lugar/, 'Polideportivo Sur');

  const filtrarButton = screen.getByText(/Aplicar Filtro/);
  await userEvent.click(filtrarButton);

  // Partidos que deberían aparecer
  expect(await screen.findByText(/Águilas - Halcones/)).toBeInTheDocument();
  expect(screen.getByText(/Perros - Lobos/)).toBeInTheDocument();
  expect(screen.getByText(/Tigres - Zorros/)).toBeInTheDocument();

  // Partidos que no deberían aparecer
  expect(screen.queryByText(/Tigres - Leones/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Búhos - Gatos/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Osos - Zorros/)).not.toBeInTheDocument();
});

it('muestra los partidos de la categoría U18 tras aplicar el filtro', async () => {
  render(
    <BrowserRouter>
      <DesignacionesView />
    </BrowserRouter>
  );

    const hoy = moment();
    const en30Dias = moment().add(30, 'days');

    const fechaInicioInput = await screen.findByLabelText(/Fecha Inicio/);
    fireEvent.change(fechaInicioInput, { target: { value: hoy.format('DD/MM/YYYY') } });
    fireEvent.blur(fechaInicioInput);

    const fechaFinInput = await screen.findByLabelText(/Fecha Fin/);
    fireEvent.change(fechaFinInput, { target: { value: en30Dias.format('DD/MM/YYYY') } });
    fireEvent.blur(fechaFinInput);

  await seleccionarOpcionAutocomplete(/Categoría/, 'U18');

  const filtrarButton = screen.getByText(/Aplicar Filtro/);
  await userEvent.click(filtrarButton);

  // Partidos que deberían aparecer
  expect(await screen.findByText(/Tigres - Leones/)).toBeInTheDocument();
  expect(screen.getByText(/Búhos - Gatos/)).toBeInTheDocument();
  expect(screen.getByText(/Osos - Zorros/)).toBeInTheDocument();

  // Partidos que no deberían aparecer
  expect(screen.queryByText(/Águilas - Halcones/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Perros - Lobos/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Tigres - Zorros/)).not.toBeInTheDocument();
});


  it('muestra los partidos de los próximos 10 días tras aplicar el filtro', async () => {
  render(
    <BrowserRouter>
      <DesignacionesView />
    </BrowserRouter>
  );

  const hoy = moment();
  const enDiezDias = moment().add(10, 'days');

  const fechaInicioInput = await screen.findByLabelText(/Fecha Inicio/);
  fireEvent.change(fechaInicioInput, { target: { value: hoy.format('DD/MM/YYYY') } });
  fireEvent.blur(fechaInicioInput);

  const fechaFinInput = await screen.findByLabelText(/Fecha Fin/);
  fireEvent.change(fechaFinInput, { target: { value: enDiezDias.format('DD/MM/YYYY') } });
  fireEvent.blur(fechaFinInput);

  const aplicarFiltroButton = screen.getByRole('button', { name: /Aplicar Filtro/i });
  await userEvent.click(aplicarFiltroButton);

  // Partidos que deberían aparecer
  expect(await screen.findByText(/Tigres - Leones/)).toBeInTheDocument();
  expect(screen.getByText(/Águilas - Halcones/)).toBeInTheDocument();
  expect(screen.getByText(/Búhos - Gatos/)).toBeInTheDocument();
  expect(screen.getByText(/Perros - Lobos/)).toBeInTheDocument();
  expect(screen.getByText(/Osos - Zorros/)).toBeInTheDocument();

  // Partidos que no deberían aparecer
  expect(screen.queryByText(/Tigres - Zorros/)).not.toBeInTheDocument();
});

 it('muestra solo los partidos que coinciden con todos los filtros combinados', async () => {
  render(
    <BrowserRouter>
      <DesignacionesView />
    </BrowserRouter>
  );

  const hoy = moment();
  const en9Dias = moment().add(9, 'days');

  const fechaInicioInput = await screen.findByLabelText(/Fecha Inicio/);
  fireEvent.change(fechaInicioInput, { target: { value: hoy.format('DD/MM/YYYY') } });
  fireEvent.blur(fechaInicioInput);

  const fechaFinInput = await screen.findByLabelText(/Fecha Fin/);
  fireEvent.change(fechaFinInput, { target: { value: en9Dias.format('DD/MM/YYYY') } });
  fireEvent.blur(fechaFinInput);

  await seleccionarOpcionAutocomplete(/Lugar/, 'Polideportivo Norte');
  await seleccionarOpcionAutocomplete(/Categoría/, 'U18');

  const aplicarFiltroButton = screen.getByRole('button', { name: /Aplicar Filtro/i });
  await userEvent.click(aplicarFiltroButton);

  // Partidos que deberían aparecer
  expect(await screen.findByText(/Tigres - Leones/)).toBeInTheDocument();
  expect(screen.getByText(/Búhos - Gatos/)).toBeInTheDocument();

  // Partidos que no deberían aparecer
  expect(screen.queryByText(/Águilas - Halcones/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Perros - Lobos/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Osos - Zorros/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Tigres - Zorros/)).not.toBeInTheDocument();
});
});
