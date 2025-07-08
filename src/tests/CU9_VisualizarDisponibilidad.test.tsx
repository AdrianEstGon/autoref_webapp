import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DisponibilidadView from '../app/components/disponibilidad/DisponibilidadView';
import disponibilidadService from '../app/services/DisponibilidadService';
import { BrowserRouter } from 'react-router-dom';
import moment from 'moment';
import dayjs from 'dayjs';

jest.mock('../app/services/DisponibilidadService', () => ({
  getDisponibilidadByUserAndDate: jest.fn(),
  actualizarDisponibilidad: jest.fn(),
  crearDisponibilidad: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: () => <div />,
}));

describe('DisponibilidadView', () => {
  const mockDisponibilidad = {
    fecha: dayjs().add(1, 'month').format('YYYY-MM-DD'),
    franja1: 1,
    franja2: 2,
    franja3: 0,
    franja4: 3,
    comentarios: 'Comentario de prueba',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('userId', '123');
    (disponibilidadService.getDisponibilidadByUserAndDate as jest.Mock).mockResolvedValue(mockDisponibilidad);
  });

  test('Carga disponibilidad del mes al iniciar', async () => {
    render(
      <BrowserRouter>
        <DisponibilidadView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(disponibilidadService.getDisponibilidadByUserAndDate).toHaveBeenCalled();
    });
  });

  test('Carga disponibilidad del nuevo mes al cambiar de mes', async () => {
    render(
      <BrowserRouter>
        <DisponibilidadView />
      </BrowserRouter>
    );

    const nextMonthButton = screen.getByRole('button', {
    name: /mes siguiente/i,
    });

    // Esperamos que cargue el mes actual primero
    await waitFor(() => {
      expect(disponibilidadService.getDisponibilidadByUserAndDate).toHaveBeenCalled();
    });

    jest.clearAllMocks(); // Limpiamos llamadas anteriores para verificar solo el nuevo mes

    // Simulamos clic en el botón para ir al siguiente mes
    fireEvent.click(nextMonthButton);

    // Esperamos que se hagan nuevas llamadas al servicio
    await waitFor(() => {
      expect(disponibilidadService.getDisponibilidadByUserAndDate).toHaveBeenCalled();
    });

    // Verifica que se haya llamado con una fecha del nuevo mes
    const firstCallArg = (disponibilidadService.getDisponibilidadByUserAndDate as jest.Mock).mock.calls[0][1];
    const currentMonth = moment().month();
    const calledMonth = moment(firstCallArg).month();

    expect(calledMonth).not.toBe(currentMonth); // Debe ser el mes siguiente
  });


});
