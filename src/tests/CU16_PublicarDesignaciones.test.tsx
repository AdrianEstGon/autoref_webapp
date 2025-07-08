import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DesignacionesView from '../app/components/gestion_designaciones/PanelDesignacionesView';
import { BrowserRouter } from 'react-router-dom';
import partidosService from '../app/services/PartidoService';
import usuariosService from '../app/services/UserService';
import categoriaService from '../app/services/CategoriaService';
import polideportivoService from '../app/services/PolideportivoService';
import disponibilidadService from '../app/services/DisponibilidadService';
import equipoService from '../app/services/EquipoService';
import notificacionesService from '../app/services/NotificacionService';
import moment from 'moment';

jest.mock('../app/services/PartidoService');
jest.mock('../app/services/UserService');
jest.mock('../app/services/CategoriaService');
jest.mock('../app/services/PolideportivoService');
jest.mock('../app/services/DisponibilidadService');
jest.mock('../app/services/EquipoService');
jest.mock('../app/services/NotificacionService');

// Mock simple del Autocomplete con select
// Mock de Autocomplete que respeta correctamente el valor y el cambio
jest.mock('@mui/material/Autocomplete', () => (props: any) => {
  const { onChange, renderInput, value, options } = props;

  const selectedValue = value?.id ?? ''; // extrae el ID si está definido

  return (
    <div>
      <select
        data-testid="mock-autocomplete"
        value={selectedValue}
        onChange={(e) => {
          const selected = props.options.find((opt: any) => opt.id === e.target.value);
          onChange(null, selected ?? null);
        }}
      >
        <option value="">Selecciona</option>
        {props.options.map((opt: any) => (
          <option key={opt.id} value={opt.id}>
            {`${opt.nombre} ${opt.primerApellido} ${opt.segundoApellido}`}
          </option>
        ))}
      </select>
      {renderInput({ InputProps: {}, inputProps: {} })}
    </div>
  );
});


describe('Flujo completo de publicación de designaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const hoy = moment().format('YYYY-MM-DD');

    
    (partidosService.getPartidos as jest.Mock).mockResolvedValue([
      {
        id: '1',
        fecha: hoy,
        hora: '10:00:00',
        equipoLocal: 'Equipo A',
        equipoVisitante: 'Equipo B',
        lugar: 'Cancha 1',
        categoria: 'Sub 15',
        categoriaId: 1,
        estadoArbitro1: 0,
        estadoArbitro2: 0,
        estadoAnotador: 0,
        arbitro1Id: null,
        arbitro2Id: null,
        anotadorId: null,
        lugarId: 1,
      },
      {
        id: '2',
        fecha: hoy,
        hora: '12:00:00',
        equipoLocal: 'Equipo C',
        equipoVisitante: 'Equipo D',
        lugar: 'Cancha 2',
        categoria: 'Sub 15',
        categoriaId: 1,
        estadoArbitro1: 0,
        estadoArbitro2: 0,
        estadoAnotador: 0,
        arbitro1Id: null,
        arbitro2Id: null,
        anotadorId: null,
        lugarId: 1,
      },
    ]);

    (usuariosService.getUsuarios as jest.Mock).mockResolvedValue([
      { id: 'u1', nombre: 'Juan', primerApellido: 'Pérez', segundoApellido: 'González' },
      { id: 'u2', nombre: 'Lucía', primerApellido: 'Ramírez', segundoApellido: 'López' },
      { id: 'u3', nombre: 'Carlos', primerApellido: 'Díaz', segundoApellido: 'Martínez' },
    ]);

    (categoriaService.getCategorias as jest.Mock).mockResolvedValue([
      { id: 1, nombre: 'Sub 15', primerArbitro: 'Nivel I', segundoArbitro: 'Nivel I', anotador: null },
    ]);

    (polideportivoService.getPolideportivos as jest.Mock).mockResolvedValue([{ id: 1, nombre: 'Cancha 1' }]);
    (equipoService.getEquipos as jest.Mock).mockResolvedValue([
      { id: 'A', clubId: 'club1' },
      { id: 'B', clubId: 'club2' },
    ]);
    (disponibilidadService.getDisponibilidades as jest.Mock).mockResolvedValue([
      { usuarioId: 'u1', fecha: hoy, franja1: 1, franja2: 1, franja3: 1, franja4: 1 },
      { usuarioId: 'u2', fecha: hoy, franja1: 1, franja2: 1, franja3: 1, franja4: 1 },
      { usuarioId: 'u3', fecha: hoy, franja1: 1, franja2: 1, franja3: 1, franja4: 1 },
    ]);

    (partidosService.actualizarPartido as jest.Mock).mockResolvedValue({});
    (notificacionesService.crearNotificacion as jest.Mock).mockResolvedValue({});
  });

it('selecciona un partido, designa automáticamente y publica correctamente', async () => {
  const user = userEvent.setup();

  render(
    <BrowserRouter>
      <DesignacionesView />
    </BrowserRouter>
  );

  // Esperar a que aparezca el texto del partido
  expect(await screen.findByText(/Equipo A - Equipo B/i)).toBeInTheDocument();

  // Buscar todos los checkboxes
  const checkboxes = screen.getAllByRole('checkbox');

  //Seleccionamos el segundo checkbox (el primero es el de "Seleccionar todos")
  const partidoCheckbox = checkboxes[1];
  await user.click(partidoCheckbox);

  // Click en "Designar Automáticamente"
  await user.click(screen.getByRole('button', { name: /Designar Automáticamente/i }));

  // Esperar que termine la asignación (esperamos a que desaparezca el texto "Asignando...")
  await waitFor(() => {
    expect(screen.queryByText(/Asignando.../i)).not.toBeInTheDocument();
  });

  // Click en "Publicar Designaciones"
  await user.click(screen.getByRole('button', { name: /Publicar Designaciones/i }));

  // Click en el botón de Confirmar del diálogo
  await user.click(await screen.findByRole('button', { name: /Confirmar/i }));

  // Verificamos las llamadas a los servicios
  await waitFor(() => {
    expect(partidosService.actualizarPartido).toHaveBeenCalledTimes(2);
    expect(notificacionesService.crearNotificacion).toHaveBeenCalledTimes(2); // 2 notificaciones por los 2 árbitros designados
  });

  const llamadas = (notificacionesService.crearNotificacion as jest.Mock).mock.calls;
  const usuariosNotificados = llamadas.map(([data]) => data.usuarioId);
  expect(usuariosNotificados).toEqual(expect.arrayContaining(['u1', 'u2']));
});

});
