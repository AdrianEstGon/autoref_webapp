import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act, createRef } from 'react';
import { MemoryRouter } from 'react-router-dom';
import DisponibilidadView from '../app/components/disponibilidad/DisponibilidadView';
import disponibilidadService from '../app/services/DisponibilidadService';

jest.useFakeTimers().setSystemTime(new Date('2025-06-25'));

jest.mock('../app/services/DisponibilidadService', () => ({
  getDisponibilidadByUserAndDate: jest.fn(),
  actualizarDisponibilidad: jest.fn(),
  crearDisponibilidad: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => null,
}));

afterEach(() => {
  jest.clearAllMocks();
});

beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => '123'); // userId
});

describe('Tests de la disponibilidad', () => {
  test('Poner disponibilidad en un día que no la tenga', async () => {
    (disponibilidadService.getDisponibilidadByUserAndDate as jest.Mock).mockResolvedValue(null);
    document.elementFromPoint = () => document.createElement('div');

    const testRef = createRef<any>();

    render(
      <MemoryRouter>
        <DisponibilidadView ref={testRef} />
      </MemoryRouter>
    );

    const testDate = new Date('2025-10-10');
    await act(async () => {
      testRef.current?.handleSelectSlot?.({ start: testDate });
    });

    const dialog = await screen.findByTestId('availability-dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/seleccionar disponibilidad/i)).toBeInTheDocument();

    const autoComplete1 = screen.getByTestId("autocomplete-franja1");
    expect(autoComplete1).toBeInTheDocument();
    const input1 = autoComplete1.querySelector('input') as HTMLInputElement;
    expect(input1).toBeInTheDocument();
    fireEvent.mouseDown(input1);
    const option = await screen.findByRole('option', { name: 'Disponible con transporte' });
    fireEvent.click(option);
    await waitFor(() => {
      expect(input1).toHaveValue('Disponible con transporte');
    });

    const autoComplete2 = screen.getByTestId("autocomplete-franja2");
    expect(autoComplete2).toBeInTheDocument();
    const input2 = autoComplete2.querySelector('input') as HTMLInputElement;
    expect(input2).toBeInTheDocument();
    fireEvent.mouseDown(input2);
    const option2 = await screen.findByRole('option', { name: 'Disponible sin transporte' });
    fireEvent.click(option2);
    await waitFor(() => {
      expect(input2).toHaveValue('Disponible sin transporte');
    });

    const autoComplete3 = screen.getByTestId("autocomplete-franja3");
    expect(autoComplete3).toBeInTheDocument();
    const input3 = autoComplete3.querySelector('input') as HTMLInputElement;
    expect(input3).toBeInTheDocument();
    fireEvent.mouseDown(input3);
    const option3 = await screen.findByRole('option', { name: 'No disponible' });
    fireEvent.click(option3);
    await waitFor(() => {
      expect(input3).toHaveValue('No disponible');
    });

    const autoComplete4 = screen.getByTestId("autocomplete-franja4");
    expect(autoComplete4).toBeInTheDocument();
    const input4 = autoComplete4.querySelector('input') as HTMLInputElement;
    expect(input4).toBeInTheDocument();
    fireEvent.mouseDown(input4);
    const option4 = await screen.findByRole('option', { name: 'Disponible con transporte' });
    fireEvent.click(option4);
    await waitFor(() => {
      expect(input4).toHaveValue('Disponible con transporte');
    });

    const commentsInput = screen.getByLabelText('Comentarios') as HTMLInputElement;
    fireEvent.change(commentsInput, { target: { value: 'Test de comentarios' } });
    expect(commentsInput).toHaveValue('Test de comentarios');

    const saveButton = screen.getByRole('button', { name: /guardar/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    setTimeout(() => {
      expect(screen.getByText(/disponibilidad actualizada con éxito/i)).toBeInTheDocument();
    }, 2000);
  }, 10000);

  test('Cambiar disponibilidad en un día que ya la tenga', async () => {
    (disponibilidadService.getDisponibilidadByUserAndDate as jest.Mock).mockResolvedValue(null);
    document.elementFromPoint = () => document.createElement('div');

    const testRef = createRef<any>();

    render(
      <MemoryRouter>
        <DisponibilidadView ref={testRef} />
      </MemoryRouter>
    );

    const testDate = new Date('2025-10-10');
    await act(async () => {
      testRef.current?.handleSelectSlot?.({ start: testDate });
    });

    const dialog = await screen.findByTestId('availability-dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/seleccionar disponibilidad/i)).toBeInTheDocument();

    await set_disponibilidad();

    // Ahora cambiamos la disponibilidad
    const autoComplete1 = screen.getByTestId("autocomplete-franja1");
    expect(autoComplete1).toBeInTheDocument();
    const input1 = autoComplete1.querySelector('input') as HTMLInputElement;
    expect(input1).toBeInTheDocument();
    fireEvent.mouseDown(input1);
    const option = await screen.findByRole('option', { name: 'No disponible' });
    fireEvent.click(option);
    await waitFor(() => {
      expect(input1).toHaveValue('No disponible');
    });

    const autoComplete2 = screen.getByTestId("autocomplete-franja2");
    expect(autoComplete2).toBeInTheDocument();
    const input2 = autoComplete2.querySelector('input') as HTMLInputElement;
    expect(input2).toBeInTheDocument();
    fireEvent.mouseDown(input2);
    const option2 = await screen.findByRole('option', { name: 'Disponible con transporte' });
    fireEvent.click(option2);
    await waitFor(() => {
      expect(input2).toHaveValue('Disponible con transporte');
    });

    const autoComplete3 = screen.getByTestId("autocomplete-franja3");
    expect(autoComplete3).toBeInTheDocument();
    const input3 = autoComplete3.querySelector('input') as HTMLInputElement;
    expect(input3).toBeInTheDocument();
    fireEvent.mouseDown(input3);
    const option3 = await screen.findByRole('option', { name: 'Disponible sin transporte' });
    fireEvent.click(option3);
    await waitFor(() => {
      expect(input3).toHaveValue('Disponible sin transporte');
    });

    const autoComplete4 = screen.getByTestId("autocomplete-franja4");
    expect(autoComplete4).toBeInTheDocument();
    const input4 = autoComplete4.querySelector('input') as HTMLInputElement;
    expect(input4).toBeInTheDocument();
    fireEvent.mouseDown(input4);
    const option4 = await screen.findByRole('option', { name: 'No disponible' });
    fireEvent.click(option4);
    await waitFor(() => {
      expect(input4).toHaveValue('No disponible');
    });

    const commentsInput = screen.getByLabelText('Comentarios') as HTMLInputElement;
    fireEvent.change(commentsInput, { target: { value: 'Comentarios actualizados' } });
    expect(commentsInput).toHaveValue('Comentarios actualizados');

    const saveButton = screen.getByRole('button', { name: /guardar/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    setTimeout(() => {
      expect(screen.getByText(/disponibilidad actualizada con éxito/i)).toBeInTheDocument();
    }, 2000);

  }, 10000);
});

// Función auxiliar para establecer disponibilidad inicial
const set_disponibilidad = async (): Promise<void> => {
  const autoComplete1 = screen.getByTestId("autocomplete-franja1");
  expect(autoComplete1).toBeInTheDocument();
  const input1 = autoComplete1.querySelector('input') as HTMLInputElement;
  expect(input1).toBeInTheDocument();
  fireEvent.mouseDown(input1);
  const option = await screen.findByRole('option', { name: 'Disponible con transporte' });
  fireEvent.click(option);
  await waitFor(() => {
    expect(input1).toHaveValue('Disponible con transporte');
  });

  const autoComplete2 = screen.getByTestId("autocomplete-franja2");
  expect(autoComplete2).toBeInTheDocument();
  const input2 = autoComplete2.querySelector('input') as HTMLInputElement;
  expect(input2).toBeInTheDocument();
  fireEvent.mouseDown(input2);
  const option2 = await screen.findByRole('option', { name: 'Disponible sin transporte' });
  fireEvent.click(option2);
  await waitFor(() => {
    expect(input2).toHaveValue('Disponible sin transporte');
  });

  const autoComplete3 = screen.getByTestId("autocomplete-franja3");
  expect(autoComplete3).toBeInTheDocument();
  const input3 = autoComplete3.querySelector('input') as HTMLInputElement;
  expect(input3).toBeInTheDocument();
  fireEvent.mouseDown(input3);
  const option3 = await screen.findByRole('option', { name: 'No disponible' });
  fireEvent.click(option3);
  await waitFor(() => {
    expect(input3).toHaveValue('No disponible');
  });

  const autoComplete4 = screen.getByTestId("autocomplete-franja4");
  expect(autoComplete4).toBeInTheDocument();
  const input4 = autoComplete4.querySelector('input') as HTMLInputElement;
  expect(input4).toBeInTheDocument();
  fireEvent.mouseDown(input4);
  const option4 = await screen.findByRole('option', { name: 'Disponible con transporte' });
  fireEvent.click(option4);
  await waitFor(() => {
    expect(input4).toHaveValue('Disponible con transporte');
  });

  const commentsInput = screen.getByLabelText('Comentarios') as HTMLInputElement;
  fireEvent.change(commentsInput, { target: { value: 'Comentarios iniciales' } });
  expect(commentsInput).toHaveValue('Comentarios iniciales');
}; 
