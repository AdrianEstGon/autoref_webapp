import moment from 'moment';
import PriorityQueue from 'js-priority-queue';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import WarningIcon from '@mui/icons-material/Warning';
import { JSX } from 'react';
import { niveles } from '@/app/utils/UserUtils';

type Arbitro = {
  id: string;
  nombre: string;
  nivel: string;
  latitud: number;
  longitud: number;
  transporte?: boolean;
  clubVinculadoId?: string; 
};

type Partido = {
  hora: string;
  id: string;
  categoriaId: number;
  fecha: string;
  lugar: string;
  equipoLocalId?: string;
  equipoVisitanteId?: string;
};

type Equipo = {
  id: string;
  clubId: string;
};

type Categoria = {
  id: number;
  minArbitros: number;
  primerArbitro: string | null;
  segundoArbitro: string | null;
  anotador: string | null;
  prioridad: number; // 1 = más prioritario ... 12 = menos prioritario
};

type Lugar = {
  nombre: string;
  latitud: number;
  longitud: number;
};

type Estado = {
  asignaciones: Record<string, { arbitro1?: Arbitro; arbitro2?: Arbitro; anotador?: Arbitro }>;
  costo: number;
};

type Designacion = {
  arbitro1?: { nombre: string; icono: JSX.Element };
  arbitro2?: { nombre: string; icono: JSX.Element };
  anotador?: { nombre: string; icono: JSX.Element };
};

export class AsignadorArbitros {

  // Constantes de configuración
  static PENALIZACION_INCOMPLETO_BASE = 100;
  static PENALIZACION_ARBITRO1_EXTRA = 2;
  static PENALIZACION_ARBITRO2_EXTRA = 1;
  static PENALIZACION_CONFLICTO_CLUB = 50;

  static ANTICIPACION_NACIONAL = 60;
  static ANTICIPACION_OTROS = 30;
  static DURACION_PARTIDO_MINUTOS = 90;
  static VELOCIDAD_VEHICULO_KMH = 90;
  static CAMINANDO_MIN_POR_KM = 4;
  static DISTANCIA_CAMINANDO_MAX_KM = 10;
  static MINUTOS_VEHICULO_LOCAL = 1.2;
  static MULTIPLICADOR_PRIORIDAD_CATEGORIAS = 5;

  usuarios: Arbitro[];
  disponibilidades: any[];
  partidos: Partido[];
  categorias: Categoria[];
  lugares: Lugar[];
  equipos: Equipo[];
  designaciones: Record<string, Designacion>;
  estadoActual: Estado | null = null; 

  constructor(
    usuarios: Arbitro[],
    disponibilidades: any[],
    designaciones: Record<string, Designacion>,
    partidos: Partido[],
    categorias: Categoria[],
    lugares: Lugar[],
    equipos: Equipo[]
  ) {
    this.usuarios = usuarios;
    this.disponibilidades = disponibilidades;
    this.designaciones = designaciones;
    this.partidos = partidos;
    this.categorias = categorias;
    this.lugares = lugares;
    this.equipos = equipos;

    // --------------- ORDENAR PARTIDOS POR PRIORIDAD ---------------
    // Esto hace que primero se asignen los partidos con categoría prioridad = 1,
    this.partidos.sort((a, b) => {
      const catA = this.categorias.find(c => c.id === a.categoriaId);
      const catB = this.categorias.find(c => c.id === b.categoriaId);
      if (!catA || !catB) return 0;
      return catA.prioridad - catB.prioridad; 
    });
    // --------------------------------------------------------------
  }

  asignarArbitros(): Record<string, Designacion> | null {
    const estadoInicial: Estado = { asignaciones: {}, costo: 0 };
    const abiertos = new PriorityQueue({
      comparator: (a: Estado, b: Estado) => {
        // Primero, se prioriza el estado que tenga más partidos realmente asignados
        const asignadosA = this.contarPartidosRealmenteAsignados(a.asignaciones);
        const asignadosB = this.contarPartidosRealmenteAsignados(b.asignaciones);

        if (asignadosB !== asignadosA) {
          // Primero el que asigne más partidos completos
          return asignadosB - asignadosA;
        }
        // Si empatan en la cantidad de partidos, el menor costo va primero
        return a.costo - b.costo;
      }
    });

    abiertos.queue(estadoInicial);
    let mejorEstado: Estado | null = null;

    while (abiertos.length > 0) {
      const estadoActual = abiertos.dequeue();
      this.estadoActual = estadoActual;
      
      if (this.esObjetivo(estadoActual)) {
        mejorEstado = estadoActual;
        break;
      }

      const nuevosEstados = this.expandirEstado(estadoActual);
      nuevosEstados.forEach(nuevoEstado => abiertos.queue(nuevoEstado));
    }
    
    return mejorEstado ? this.formatDesignaciones(mejorEstado.asignaciones) : null;
  }

  private contarPartidosRealmenteAsignados(asignaciones: Estado["asignaciones"]): number {
    return Object.values(asignaciones).filter(({ arbitro1, arbitro2, anotador }) => {
      const valido = (a?: Arbitro) => a && a.nombre !== 'Incompleto';
      return valido(arbitro1) || valido(arbitro2) || valido(anotador);
    }).length;
  }
  
  private esObjetivo(estado: Estado): boolean {
    return Object.keys(estado.asignaciones).length === this.partidos.length;
  }

  expandirEstado(estado: Estado): Estado[] {
    const nuevosEstados: Estado[] = [];

    // Encuentra los partidos que aún no se han asignado
    const partidosSinAsignar = this.partidos.filter(p => !estado.asignaciones[p.id]);

    // Si no hay partidos sin asignar, no hay expansión posible
    if (partidosSinAsignar.length === 0) return [];

    // Se coge el primer partido sin asignar
    const partidoSinAsignar = partidosSinAsignar[0];
    const categoria = this.categorias.find(c => c.id === partidoSinAsignar.categoriaId)!;

    // Obtenemos los árbitros disponibles para este partido
    const arbitrosDisponibles = this.obtenerArbitrosDisponibles(partidoSinAsignar);

    const opcionesArbitro1 = categoria.primerArbitro && categoria.primerArbitro !== 'NO'
      ? arbitrosDisponibles.filter(a => this.nivelIndex(a.nivel) >= this.nivelIndex(categoria.primerArbitro!))
      : [];
    const opcionesArbitro2 = categoria.segundoArbitro && categoria.segundoArbitro !== 'NO'
      ? arbitrosDisponibles.filter(a => this.nivelIndex(a.nivel) >= this.nivelIndex(categoria.segundoArbitro!))
      : [];
    const opcionesAnotador = categoria.anotador && categoria.anotador !== 'NO'
      ? arbitrosDisponibles.filter(a => this.nivelIndex(a.nivel) >= this.nivelIndex(categoria.anotador!))
      : [];

    

    // Árbitro de relleno para el "incompleto"
    const arbitroIncompleto: Arbitro = {
      id: 'incompleto',
      nombre: 'Incompleto',
      nivel: '',
      latitud: 0,
      longitud: 0,
      transporte: false
    };

    const penalizacionIncompleto = AsignadorArbitros.PENALIZACION_INCOMPLETO_BASE;

    const combinacionesConCosto: {
      combinacion: [Arbitro | null, Arbitro | null, Arbitro | null];
      costoTotal: number;
    }[] = [];

    for (const a1 of [...opcionesArbitro1, null]) {
      for (const a2 of [...opcionesArbitro2, null]) {
        for (const an of [...opcionesAnotador, null]) {
          const arbitrosAsignados = [a1, a2, an].filter(a => a !== null) as Arbitro[];
          const ids = arbitrosAsignados.map(a => a.id);
          // Si hay repetidos, no es una combinación válida
          if (new Set(ids).size !== ids.length) continue;

          // Comprobamos si todos pueden asistir (transporte, tiempos...)
          if (!this.puedenAsistir(partidoSinAsignar, arbitrosAsignados)) continue;

          // Calculamos coste acumulado
          let costoTotal = arbitrosAsignados.reduce(
            (acc, arbitro) => acc + this.calcularCosto( arbitro, partidoSinAsignar),
            0
          );

          // Penalizaciones extra por "incompletos"
          const a1Final = a1 ?? (categoria.primerArbitro && categoria.primerArbitro !== 'NO' ? arbitroIncompleto : null);
          const a2Final = a2 ?? (categoria.segundoArbitro && categoria.segundoArbitro !== 'NO' ? arbitroIncompleto : null);
          const anFinal = an ?? (categoria.anotador && categoria.anotador !== 'NO' ? arbitroIncompleto : null);

          if (a1Final === arbitroIncompleto) {
            costoTotal += penalizacionIncompleto
              + AsignadorArbitros.PENALIZACION_ARBITRO1_EXTRA;

          }
          if (a2Final === arbitroIncompleto) {
            costoTotal += penalizacionIncompleto
              + AsignadorArbitros.PENALIZACION_ARBITRO2_EXTRA;
          }
          if (anFinal === arbitroIncompleto) {
            costoTotal += penalizacionIncompleto;
          }

          combinacionesConCosto.push({
            combinacion: [a1Final, a2Final, anFinal],
            costoTotal
          });
        }
      }
    }

    // Ordenamos las combinaciones por el costo total (ascendente)
    combinacionesConCosto.sort((a, b) => a.costoTotal - b.costoTotal);

    // Cogemos las mejores 5 combinaciones
    for (const { combinacion, costoTotal } of combinacionesConCosto.slice(0, 5)) {
      const nuevoEstado: Estado = JSON.parse(JSON.stringify(estado));
      nuevoEstado.asignaciones[partidoSinAsignar.id] = {
        arbitro1: combinacion[0] || undefined,
        arbitro2: combinacion[1] || undefined,
        anotador: combinacion[2] || undefined
      };
      nuevoEstado.costo += costoTotal;
      nuevosEstados.push(nuevoEstado);
    }

    return nuevosEstados;
  }

  private puedenAsistir(partido: Partido, arbitros: Arbitro[]): boolean {
    const lugarPartido = this.lugares.find(l => l.nombre === partido.lugar);
    if (!lugarPartido) return false;
    const { latitud: latPartido, longitud: lonPartido } = lugarPartido;

    return arbitros.every(arbitro => {
      // Si el árbitro tiene transporte propio, ok
      if (arbitro.transporte) return true;

      // Si no tiene transporte, comprobamos la distancia para ir andando
      const distanciaDirecta = this.calcularDistancia(arbitro.latitud, arbitro.longitud, latPartido, lonPartido);
      if (distanciaDirecta <= 10) return true;

      // O miramos si algún otro árbitro de este partido sí tiene transporte y vive cerca (<=10km)
      return arbitros.some(a =>
        a.id !== arbitro.id &&
        a.transporte &&
        this.calcularDistancia(a.latitud, a.longitud, arbitro.latitud, arbitro.longitud) <= 10
      );
    });
  }

  private obtenerArbitrosDisponibles(partido: Partido): Arbitro[] {
    return this.usuarios.filter(usuario => this.cumpleCondiciones(usuario, partido));
  }

 private cumpleCondiciones(arbitro: Arbitro, partido: Partido): boolean {
  if (!this.validarUbicacionYCategoria(partido)) return false;
  if (!this.verificarSolapes(arbitro, partido)) return false;
  if (!this.validarDisponibilidad(arbitro, partido)) return false;
  return true;
}

private validarUbicacionYCategoria(partido: Partido): boolean {
  const ubicacion = this.lugares.find(l => l.nombre === partido.lugar);
  const categoria = this.categorias.find(c => c.id === partido.categoriaId);
  return !!ubicacion && !!categoria;
}

private verificarSolapes(arbitro: Arbitro, partido: Partido): boolean {
  const construirMomento = (p: Partido) =>
    moment(`${moment(p.fecha).format('YYYY-MM-DD')} ${p.hora}`, 'YYYY-MM-DD HH:mm:ss');

  for (const [partidoId, asignacion] of Object.entries(this.estadoActual?.asignaciones || {})) {
    const otroPartido = this.partidos.find(p => p.id === partidoId);
    if (!otroPartido) continue;

    const yaAsignado = Object.values(asignacion).some(a => a?.id === arbitro.id);
    if (!yaAsignado) continue;

    const momento1 = construirMomento(partido);
    const momento2 = construirMomento(otroPartido);
    const [primero, segundo] = momento1.isBefore(momento2)
      ? [partido, otroPartido]
      : [otroPartido, partido];

    const [momentoPrimero, momentoSegundo] = [construirMomento(primero), construirMomento(segundo)];
    const anticipacion1 = this.obtenerAnticipacion(primero);
    const anticipacion2 = this.obtenerAnticipacion(segundo);
    const tiempoTransporte = this.estimarTiempoTransporte(arbitro, primero, segundo);

    const inicio1 = momentoPrimero.clone().subtract(anticipacion1, 'minutes');
    const fin1 = inicio1.clone().add(AsignadorArbitros.DURACION_PARTIDO_MINUTOS + anticipacion1, 'minutes');
    const inicio2 = momentoSegundo.clone().subtract(anticipacion2 + tiempoTransporte, 'minutes');

    if (fin1.isAfter(inicio2)) return false;
  }

  return true;
}

private validarDisponibilidad(arbitro: Arbitro, partido: Partido): boolean {
  const franja = this.obtenerFranjaHoraria(partido.hora);
  if (!franja) return false;

  const fecha = moment(partido.fecha).format('YYYY-MM-DD');
  const disponibilidad = this.disponibilidades.find(
    d => d.usuarioId === arbitro.id && moment(d.fecha).format('YYYY-MM-DD') === fecha
  );

  if (!disponibilidad || !disponibilidad[franja]) return false;

  const estado = disponibilidad[franja];
  if (estado === 3) return false;

  arbitro.transporte = estado === 1;
  return true;
}


  private obtenerAnticipacion(partido: Partido): number {
    const categoria = this.categorias.find(c => c.id === partido.categoriaId);
    if (!categoria) return AsignadorArbitros.ANTICIPACION_OTROS;

    const nombreCategoria = (categoria as any).nombre?.toUpperCase() || '';

    // categorías 'NACIONAL', 'SUPERLIGA' con mayor anticipación
    if (nombreCategoria.includes("NACIONAL") || nombreCategoria.includes("SUPERLIGA")) {
      return AsignadorArbitros.ANTICIPACION_NACIONAL;
    }

    // Si no es nacional, 30 min de anticipación
    return AsignadorArbitros.ANTICIPACION_OTROS;
  }

  private obtenerFranjaHoraria(horaStr: string): string {
    const hora = moment(horaStr, 'HH:mm:ss').hour();

    if (hora >= 9 && hora < 12) return 'franja1';
    if (hora >= 12 && hora < 15) return 'franja2';
    if (hora >= 15 && hora < 18) return 'franja3';
    if (hora >= 18 && hora < 21) return 'franja4';

    // Si está fuera de estos rangos, se considera que no hay franja horaria válida
    return '';
  }

  private calcularCosto(arbitro: Arbitro, partido: Partido): number {
    const ubicacionPartido = this.lugares.find(l => l.nombre === partido.lugar);
    if (!ubicacionPartido) return Infinity;

    // Distancia como coste base
    let costo = this.calcularDistancia(
      arbitro.latitud,
      arbitro.longitud,
      ubicacionPartido.latitud,
      ubicacionPartido.longitud
    );

    // Penalizar con la prioridad de la categoría
    const categoria = this.categorias.find(c => c.id === partido.categoriaId);
    if (!categoria) return Infinity;

    // Coste adicional según prioridad de la categoría
    const costePrioridad = categoria.prioridad * AsignadorArbitros.MULTIPLICADOR_PRIORIDAD_CATEGORIAS;
    costo += costePrioridad;

    // Penalización por conflicto (club vinculado con equipo local o visitante)
    if (arbitro.clubVinculadoId) {
      const equipoLocal = this.equipos.find(e => e.id === partido.equipoLocalId);
      const equipoVisitante = this.equipos.find(e => e.id === partido.equipoVisitanteId);

      const clubLocal = equipoLocal?.clubId;
      const clubVisitante = equipoVisitante?.clubId;

      if (clubLocal === arbitro.clubVinculadoId || clubVisitante === arbitro.clubVinculadoId) {
        costo += AsignadorArbitros.PENALIZACION_CONFLICTO_CLUB;
      }
    }

    return costo;
  }

  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Distancia aproximada en km usando la fórmula de Haversine
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * (Math.PI / 180)) *
              Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private estimarTiempoTransporte(arbitro: Arbitro, desde: Partido, hasta: Partido): number {
    const origen = this.lugares.find(l => l.nombre === desde.lugar);
    const destino = this.lugares.find(l => l.nombre === hasta.lugar);
    if (!origen || !destino) return 0;

    const distancia = this.calcularDistancia(origen.latitud, origen.longitud, destino.latitud, destino.longitud);

    let tieneTransporte = arbitro.transporte;

    if (!tieneTransporte && this.estadoActual) {
      // 1. Verifica si algún compañero del partido "desde" tiene transporte
      const asignacionDesde = this.estadoActual.asignaciones[desde.id];
      const compañeros = asignacionDesde
        ? [asignacionDesde.arbitro1, asignacionDesde.arbitro2, asignacionDesde.anotador]
            .filter(a => a && a.id !== arbitro.id) as Arbitro[]
        : [];

      const compañeroConTransporte = compañeros.some(comp => comp.transporte);

      // 2. Verifica si hay otros árbitros con transporte cerca del arbitro que hay que llevar
      const alguienCercaConTransporte = this.usuarios.some(a =>
        a.id !== arbitro.id &&
        a.transporte &&
        this.calcularDistancia(origen.latitud, origen.longitud, a.latitud, a.longitud) <= 10
      );

      if (compañeroConTransporte || alguienCercaConTransporte) {
        tieneTransporte = true;
      }
    }

    // Cálculo del tiempo en minutos
    if (tieneTransporte) {
      // Distancias grandes => velocidad típica del vehículo (90 km/h),
      // distancias pequeñas => factor local (1.2 min/km)
      return distancia > 10.0
        ? Math.round((distancia / 60) * AsignadorArbitros.VELOCIDAD_VEHICULO_KMH)
        : Math.round(distancia * AsignadorArbitros.MINUTOS_VEHICULO_LOCAL);
    } else {
      // Caminando => 4 minutos por km
      return Math.round(distancia * AsignadorArbitros.CAMINANDO_MIN_POR_KM);
    }
  }

  private nivelIndex(nivel: string): number {
    return niveles.indexOf(nivel);
  }

  private formatDesignaciones(asignaciones: Estado["asignaciones"]): Record<string, Designacion> {
    const designaciones: Record<string, Designacion> = {};

    Object.entries(asignaciones).forEach(([partidoId, asignacion]) => {
      const getIcono = (arbitro?: Arbitro) => {
        if (!arbitro) return undefined;
        if (arbitro.nombre === "Incompleto") {
          return {
            nombre: "Incompleto",
            icono: <WarningIcon style={{ color: 'orange' }} />
          };
        }

        const tieneTransporte = arbitro.transporte;
        const IconComponent = tieneTransporte ? DirectionsCarIcon : DirectionsWalkIcon;
        const color = tieneTransporte ? 'blue' : 'green';

        return {
          ...arbitro,
          icono: <IconComponent style={{ color }} />
        };
      };

      designaciones[partidoId] = {
        arbitro1: getIcono(asignacion.arbitro1),
        arbitro2: getIcono(asignacion.arbitro2),
        anotador: getIcono(asignacion.anotador)
      };
    });

    return designaciones;
  }
}
