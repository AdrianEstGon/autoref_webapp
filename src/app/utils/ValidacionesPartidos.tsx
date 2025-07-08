export function validarPartido(
    partido: {
      equipoLocalId: string;
      equipoVisitanteId: string;
      fecha: string;
      hora: string;
      lugarId: string;
      categoriaId: string;
      jornada: string;
      numeroPartido: string;
    },
    erroresTemp: {
      equipoLocalId: string;
      equipoVisitanteId: string;
      fecha: string;
      hora: string;
      lugarId: string;
      categoriaId: string;
      jornada: string;
      numeroPartido: string;
    },
    isValid: boolean
  ): boolean {
    if (!(partido.equipoLocalId)) {
      erroresTemp.equipoLocalId = 'Debe seleccionarse un equipo local.';
      isValid = false;
    } else {
      erroresTemp.equipoLocalId = '';
    }
  
    if (!(partido.equipoVisitanteId)) {
      erroresTemp.equipoVisitanteId = 'Debe seleccionarse un equipo visitante.';
      isValid = false;
    } else {
      erroresTemp.equipoVisitanteId = '';
    }
  
    if (!partido.fecha) {
      erroresTemp.fecha = 'Debe selecionarse una fecha.';
      isValid = false;
    } else {
      erroresTemp.fecha = '';
    }
  
    if (!partido.hora) {
      erroresTemp.hora = 'Debe seleccionarse una hora.';
      isValid = false;
    } else {
      erroresTemp.hora = '';
    }

    if (!partido.lugarId) {
      erroresTemp.lugarId = 'Debe seleccionarse un polideportivo.';
      isValid = false;
    } else {
      erroresTemp.lugarId = '';
    }
  
    if (!(partido.categoriaId)) {
      erroresTemp.categoriaId = 'La categoría no es válida.';
      isValid = false;
    } else {
      erroresTemp.categoriaId = '';
    }
  
    if (!validarNumeroPositivo(partido.jornada)) {
      erroresTemp.jornada = 'El número de jornada debe ser positivo.';
      isValid = false;
    } else {
      erroresTemp.jornada = '';
    }

    if (!validarNumeroPositivo(partido.numeroPartido)) {
      erroresTemp.numeroPartido = 'El número de partido debe ser positivo.';
      isValid = false;
    } else {
      erroresTemp.numeroPartido = '';
    }
  
    return isValid;
  }
  
  // Función auxiliar para validar que solo haya texto alfabético y espacios
  const validarTexto = (texto: string): boolean => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/;
    return regex.test(texto.trim());
  };

  const validarNumeroPositivo = (n: string): boolean => {
    const numero = parseInt(n, 10);
    return !isNaN(numero) && numero > 0;
  };
  