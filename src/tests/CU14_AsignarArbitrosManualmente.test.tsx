// DesignacionesView.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DesignacionesView from '../app/components/gestion_designaciones/PanelDesignacionesView';
import { BrowserRouter } from 'react-router-dom';
import partidosService from '../app/services/PartidoService';
import usuariosService from '../app/services/UserService';
import categoriaService from '../app/services/CategoriaService';
import polideportivoService from '../app/services/PolideportivoService';
import disponibilidadService from '../app/services/DisponibilidadService';
import equipoService from '../app/services/EquipoService';
import moment from 'moment';

// ✅ Mock de Autocomplete con múltiples árbitros
jest.mock('@mui/material/Autocomplete', () => (props: any) => {
  const { onChange, renderInput } = props;

  const mockedOptions = [
    { id: 'u1', nombre: 'Juan', primerApellido: 'Pérez', segundoApellido: 'González' },
    { id: 'u2', nombre: 'Lucía', primerApellido: 'Ramírez', segundoApellido: 'López' },
    { id: 'u3', nombre: 'Carlos', primerApellido: 'Díaz', segundoApellido: 'Martínez' },
  ];

  return (
    <div>
      <select
        data-testid="mock-autocomplete"
        onChange={(e) => {
          const selected = mockedOptions.find((opt: any) => opt.id === e.target.value);
          onChange(null, selected);
        }}
      >
        <option value="">Selecciona</option>
        {mockedOptions.map((opt: any) => (
          <option key={opt.id} value={opt.id}>
            {`${opt.nombre} ${opt.primerApellido} ${opt.segundoApellido}`}
          </option>
        ))}
      </select>
      {renderInput({ InputProps: {}, inputProps: {} })}
    </div>
  );
});

describe('DesignacionesView', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(partidosService, 'getPartidos').mockResolvedValue([
      {
        id: '1',
        fecha: moment().format('YYYY-MM-DD'),
        hora: '10:00:00',
        equipoLocal: 'Equipo A',
        equipoVisitante: 'Equipo B',
        lugar: 'Cancha 1',
        categoria: 'Sub 15',
        estadoArbitro1: 0,
        estadoArbitro2: 0,
        estadoAnotador: 0,
        arbitro1Id: null,
        arbitro2Id: null,
        anotadorId: null,
      },
    ]);

    jest.spyOn(usuariosService, 'getUsuarios').mockResolvedValue([
      { id: 'u1', nombre: 'Juan', primerApellido: 'Pérez', segundoApellido: 'González' },
      { id: 'u2', nombre: 'Lucía', primerApellido: 'Ramírez', segundoApellido: 'López' },
      { id: 'u3', nombre: 'Carlos', primerApellido: 'Díaz', segundoApellido: 'Martínez' },
    ]);

    jest.spyOn(categoriaService, 'getCategorias').mockResolvedValue([{ nombre: 'Sub 15' }]);
    jest.spyOn(polideportivoService, 'getPolideportivos').mockResolvedValue([{ nombre: 'Cancha 1' }]);
    jest.spyOn(disponibilidadService, 'getDisponibilidades').mockResolvedValue([
      {
        usuarioId: 'u1',
        fecha: moment().format('YYYY-MM-DD'),
        franja1: 1,
        franja2: 1,
        franja3: 1,
        franja4: 1,
      },
      {
        usuarioId: 'u2',
        fecha: moment().format('YYYY-MM-DD'),
        franja1: 1,
        franja2: 1,
        franja3: 1,
        franja4: 1,
      },
      {
        usuarioId: 'u3',
        fecha: moment().format('YYYY-MM-DD'),
        franja1: 1,
        franja2: 1,
        franja3: 1,
        franja4: 1,
      },
    ]);

    jest.spyOn(equipoService, 'getEquipos').mockResolvedValue([]);
  });

  it('muestra múltiples opciones de árbitros en el autocomplete', async () => {
    render(
      <BrowserRouter>
        <DesignacionesView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Equipo A - Equipo B/i)).toBeInTheDocument();
    });

    const selects = await screen.findAllByTestId('mock-autocomplete');
    const arbitro1Select = selects[0];

    expect(arbitro1Select).toBeInTheDocument();
    expect(arbitro1Select).toHaveTextContent('Juan Pérez González');
    expect(arbitro1Select).toHaveTextContent('Lucía Ramírez López');
    expect(arbitro1Select).toHaveTextContent('Carlos Díaz Martínez');
  });

  it('permite asignar arbitro1, arbitro2 y anotador distintos al partido', async () => {
    render(
      <BrowserRouter>
        <DesignacionesView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Equipo A - Equipo B/i)).toBeInTheDocument();
    });

    const selects = await screen.findAllByTestId('mock-autocomplete');

    fireEvent.change(selects[0], { target: { value: 'u1' } }); // Arbitro 1: Juan
    fireEvent.change(selects[1], { target: { value: 'u2' } }); // Arbitro 2: Lucía
    fireEvent.change(selects[2], { target: { value: 'u3' } }); // Anotador: Carlos

    await waitFor(() => {
      expect(screen.getByDisplayValue(/Juan Pérez González/)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Lucía Ramírez López/)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Carlos Díaz Martínez/)).toBeInTheDocument();
    });
  });
  // asigna un arbitro1 a un partido
  it('asigna un arbitro1 a un partido', async () => {
    render(
      <BrowserRouter>
        <DesignacionesView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Equipo A - Equipo B/i)).toBeInTheDocument();
    });

    const selects = await screen.findAllByTestId('mock-autocomplete');

    fireEvent.change(selects[0], { target: { value: 'u1' } }); // Arbitro 1: Juan

    await waitFor(() => {
      expect(screen.getByDisplayValue(/Juan Pérez González/)).toBeInTheDocument();
    });
  });
    // asigna un arbitro2 a un partido
    it('asigna un arbitro2 a un partido', async () => {
        render(
            <BrowserRouter>
            <DesignacionesView />
            </BrowserRouter>
        );
    
        await waitFor(() => {
            expect(screen.getByText(/Equipo A - Equipo B/i)).toBeInTheDocument();
        });
    
        const selects = await screen.findAllByTestId('mock-autocomplete');
    
        fireEvent.change(selects[1], { target: { value: 'u2' } }); // Arbitro 2: Lucía
    
        await waitFor(() => {
            expect(screen.getByDisplayValue(/Lucía Ramírez López/)).toBeInTheDocument();
        });
    });
    // asigna un anotador a un partido
    it('asigna un anotador a un partido', async () => {
        render(
            <BrowserRouter>
            <DesignacionesView />
            </BrowserRouter>
        );
    
        await waitFor(() => {
            expect(screen.getByText(/Equipo A - Equipo B/i)).toBeInTheDocument();
        });
    
        const selects = await screen.findAllByTestId('mock-autocomplete');
    
        fireEvent.change(selects[2], { target: { value: 'u3' } }); // Anotador: Carlos
    
        await waitFor(() => {
            expect(screen.getByDisplayValue(/Carlos Díaz Martínez/)).toBeInTheDocument();
        });
    });
    // Asigna a un partido un arbitro1, un arbitro2 pero sin anotador
    it('asigna un arbitro1 y un arbitro2 a un partido sin anotador', async () => {
        render(
            <BrowserRouter>
            <DesignacionesView />
            </BrowserRouter>
        );
    
        await waitFor(() => {
            expect(screen.getByText(/Equipo A - Equipo B/i)).toBeInTheDocument();
        });
    
        const selects = await screen.findAllByTestId('mock-autocomplete');
    
        fireEvent.change(selects[0], { target: { value: 'u1' } }); // Arbitro 1: Juan
        fireEvent.change(selects[1], { target: { value: 'u2' } }); // Arbitro 2: Lucía
    
        await waitFor(() => {
            expect(screen.getByDisplayValue(/Juan Pérez González/)).toBeInTheDocument();
            expect(screen.getByDisplayValue(/Lucía Ramírez López/)).toBeInTheDocument();
        });
    });
  // Asigna a un partido un arbitro1, un anotador pero sin arbitro2
  it('asigna un arbitro1 y un anotador a un partido sin arbitro2', async () => {
    render(
      <BrowserRouter>
        <DesignacionesView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Equipo A - Equipo B/i)).toBeInTheDocument();
    });

    const selects = await screen.findAllByTestId('mock-autocomplete');

    fireEvent.change(selects[0], { target: { value: 'u1' } }); // Arbitro 1: Juan
    fireEvent.change(selects[2], { target: { value: 'u3' } }); // Anotador: Carlos

    await waitFor(() => {
      expect(screen.getByDisplayValue(/Juan Pérez González/)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Carlos Díaz Martínez/)).toBeInTheDocument();
    });
  });
  it('no muestra un árbitro no disponible en la franja horaria del partido', async () => {
  jest.spyOn(usuariosService, 'getUsuarios').mockResolvedValue([
    { id: 'u1', nombre: 'Juan', primerApellido: 'Pérez', segundoApellido: 'González' },
    { id: 'u2', nombre: 'Lucía', primerApellido: 'Ramírez', segundoApellido: 'López' },
    { id: 'u3', nombre: 'Carlos', primerApellido: 'Díaz', segundoApellido: 'Martínez' },
    { id: 'u4', nombre: 'Mario', primerApellido: 'Sánchez', segundoApellido: 'López' }, // Nuevo usuario
  ]);

  jest.spyOn(disponibilidadService, 'getDisponibilidades').mockResolvedValue([
    {
      usuarioId: 'u1',
      fecha: moment().format('YYYY-MM-DD'),
      franja1: 1,
      franja2: 1,
      franja3: 1,
      franja4: 1,
    },
    {
      usuarioId: 'u2',
      fecha: moment().format('YYYY-MM-DD'),
      franja1: 1,
      franja2: 1,
      franja3: 1,
      franja4: 1,
    },
    {
      usuarioId: 'u3',
      fecha: moment().format('YYYY-MM-DD'),
      franja1: 1,
      franja2: 1,
      franja3: 1,
      franja4: 1,
    },
    {
      usuarioId: 'u4', // Mario no disponible en franja 1
      fecha: moment().format('YYYY-MM-DD'),
      franja1: 3,
      franja2: 1,
      franja3: 1,
      franja4: 1,
    },
  ]);

  render(
    <BrowserRouter>
      <DesignacionesView />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Equipo A - Equipo B/i)).toBeInTheDocument();
  });

  const selects = await screen.findAllByTestId('mock-autocomplete');
  const arbitro1Select = selects[0];

  // ✅ Mario (u4) no debería aparecer porque no está disponible en franja1
  expect(arbitro1Select).toBeInTheDocument();
  expect(arbitro1Select).toHaveTextContent('Juan Pérez González');
  expect(arbitro1Select).toHaveTextContent('Lucía Ramírez López');
  expect(arbitro1Select).toHaveTextContent('Carlos Díaz Martínez');
  expect(arbitro1Select).not.toHaveTextContent('Mario Sánchez López');
});

});
