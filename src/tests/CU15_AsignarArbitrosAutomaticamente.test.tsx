// tests/asignadorArbitros.test.tsx

import { AsignadorArbitros } from "@/app/components/gestion_designaciones/AsignadorArbitros";

const cloneDeep = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const usuariosBase = [
  {
    id: "user1",
    userName: "arbitro1@mail.com",
    nombre: "Pedro",
    primerApellido: "Gómez",
    segundoApellido: "López",
    fechaNacimiento: "1990-01-01",
    latitud: 43.36,
    longitud: -5.84,
    nivel: "Nivel II + Hab. Nacional C Pista",
    transporte: true,
    roles: ["Arbitro"],
    clubVinculadoId: undefined as string | undefined,
  },
  {
    id: "user2",
    userName: "arbitro2@mail.com",
    nombre: "Juan",
    primerApellido: "Pérez",
    segundoApellido: "Martínez",
    fechaNacimiento: "1992-02-02",
    latitud: 43.37,
    longitud: -5.85,
    nivel: "Nivel I",
    transporte: true,
    roles: ["Arbitro"],
    clubVinculadoId: undefined,
  },
  {
    id: "user3",
    userName: "arbitro3@mail.com",
    nombre: "Luis",
    primerApellido: "Fernández",
    segundoApellido: "García",
    fechaNacimiento: "1985-03-03",
    latitud: 43.38,
    longitud: -5.86,
    nivel: "Nivel II + Hab. Nacional C Pista",
    transporte: true,
    roles: ["Arbitro"],
    clubVinculadoId: undefined,
  },
];

const disponibilidadesBase = [
  {
    id: "disp1",
    usuarioId: "user1",
    fecha: "2025-05-31",
    franja1: 1,
    franja2: 0,
    franja3: 0,
    franja4: 0,
    comentarios: "",
  },
  {
    id: "disp2",
    usuarioId: "user2",
    fecha: "2025-05-31",
    franja1: 0,
    franja2: 0,
    franja3: 1,
    franja4: 1,
    comentarios: "",
  },
  {
    id: "disp3",
    usuarioId: "user3",
    fecha: "2025-05-31",
    franja1: 1,
    franja2: 1,
    franja3: 1,
    franja4: 1,
    comentarios: "",
  },
];

const categoriasBase = [
  {
    id: 1,
    nombre: "Primera",
    primerArbitro: "Nivel II + Hab. Nacional C Pista",
    segundoArbitro: "Nivel I",
    anotador: null,
    minArbitros: 2,
    prioridad: 1,
  },
  {
    id: 2,
    nombre: "Nacional",
    primerArbitro: "Nacional C Pista",
    segundoArbitro: "Nivel II Pista",
    anotador: "Nivel I Pista",
    minArbitros: 3,
    prioridad: 10,
  },
];

const lugaresBase = [
  {
    id: "lugar1",
    nombre: "Pabellón 1",
    latitud: 43.36,
    longitud: -5.84,
  },
  {
    id: "lugar2",
    nombre: "Pabellón 2",
    latitud: 43.37,
    longitud: -5.85,
  },
];

const equiposBase: any[] = [
  { id: "A", clubId: "club1" },
  { id: "B", clubId: "club2" },
  { id: "C", clubId: "club3" },
  { id: "D", clubId: "club4" },
];

const designacionesBase = {
  partido1: { arbitro1: undefined, arbitro2: undefined, anotador: undefined },
  partido2: { arbitro1: undefined, arbitro2: undefined, anotador: undefined },
};

const crearPartidos = (categoriaId: number, hora: string, lugar: string) => [
  {
    id: "partido1",
    equipoLocalId: "A",
    equipoVisitanteId: "B",
    fecha: "2025-05-31",
    hora,
    lugar,
    categoriaId,
  },
];
const partidosAAsignarBase = [
  {
    id: "partido1",
    equipoLocalId: "A",
    equipoVisitanteId: "B",
    fecha: "2025-05-31",
    hora: "10:00:00",
    lugar: "Pabellón 1",
    categoriaId: 1,
  },
  {
    id: "partido2",
    equipoLocalId: "C",
    equipoVisitanteId: "D",
    fecha: "2025-05-31",
    hora: "10:00:00",
    lugar: "Pabellón 2",
    categoriaId: 1,
  },
];


test('asigna árbitros correctamente en múltiples partidos que se disputan simultaneamente', () => {
  const usuarios = cloneDeep(usuariosBase);
  const disponibilidades = cloneDeep(disponibilidadesBase);
  const categorias = cloneDeep(categoriasBase);
  const lugares = cloneDeep(lugaresBase);
  const equipos = cloneDeep(equiposBase);
  const designaciones = cloneDeep(designacionesBase);
  const partidosAAsignar = cloneDeep(partidosAAsignarBase);

  const asignador = new AsignadorArbitros(
    usuarios,
    disponibilidades,
    designaciones,
    partidosAAsignar,
    categorias,
    lugares,
    equipos
  );

  const nuevasDesignaciones = asignador.asignarArbitros();

  expect(nuevasDesignaciones!["partido1"].arbitro1?.nombre).toBe("Pedro");
  expect(nuevasDesignaciones!["partido1"].arbitro2?.nombre).toBe("Incompleto");
  expect(nuevasDesignaciones!["partido2"].arbitro1?.nombre).toBe("Luis");
  expect(nuevasDesignaciones!["partido2"].arbitro2?.nombre).toBe("Incompleto");
});

test('asigna árbitros correctamente en múltiples partidos que se disputan en distintos horarios', () => {
  const usuarios = cloneDeep(usuariosBase);
  const disponibilidades = cloneDeep(disponibilidadesBase);
  const categorias = cloneDeep(categoriasBase);
  const lugares = cloneDeep(lugaresBase);
  const equipos = cloneDeep(equiposBase);
  const designaciones = cloneDeep(designacionesBase);
  const partidosAAsignar = cloneDeep(partidosAAsignarBase);

  const asignador = new AsignadorArbitros(
    usuarios,
    disponibilidades,
    designaciones,
    partidosAAsignar,
    categorias,
    lugares,
    equipos
  );

  // Modificar el segundo partido para que tenga una hora diferente
  partidosAAsignar[1].hora = "15:00:00";

  const nuevasDesignaciones = asignador.asignarArbitros();

   expect(nuevasDesignaciones!["partido1"].arbitro1?.nombre).toBe("Pedro");
  expect(nuevasDesignaciones!["partido1"].arbitro2?.nombre).toBe("Luis");
  expect(nuevasDesignaciones!["partido2"].arbitro1?.nombre).toBe("Luis");
  expect(nuevasDesignaciones!["partido2"].arbitro2?.nombre).toBe("Juan");
});

test('no asigna árbitro sin disponibilidad', () => {
  const usuarios = cloneDeep(usuariosBase);
  const disponibilidades = cloneDeep(disponibilidadesBase);
  const categorias = cloneDeep(categoriasBase);
  const lugares = cloneDeep(lugaresBase);
  const equipos = cloneDeep(equiposBase);
  const designaciones = cloneDeep(designacionesBase);
  const partidosAAsignar = cloneDeep(partidosAAsignarBase);

  // Eliminar todas las disponibilidades para user1
  disponibilidades.forEach(disp => {
    if (disp.usuarioId === "user1") {
      disp.franja1 = 0;
      disp.franja2 = 0;
      disp.franja3 = 0;
      disp.franja4 = 0;
    }
  });

  const asignador = new AsignadorArbitros(
    usuarios,
    disponibilidades,
    designaciones,
    partidosAAsignar,
    categorias,
    lugares,
    equipos
  );

  const nuevasDesignaciones = asignador.asignarArbitros();

   expect(nuevasDesignaciones!["partido1"].arbitro1?.nombre).not.toBe("Pedro"); // porque no tiene disponibilidad
});
// Test: no asignar árbitro con nivel insuficiente para primer árbitro en categoría
test('no asigna árbitro con nivel insuficiente para primer árbitro en categoría', () => {
  const usuarios = cloneDeep(usuariosBase);
  const disponibilidades = cloneDeep(disponibilidadesBase);
  const categorias = cloneDeep(categoriasBase);
  const lugares = cloneDeep(lugaresBase);
  const equipos = cloneDeep(equiposBase);
  const designaciones = cloneDeep(designacionesBase);
  const partidosAAsignar = cloneDeep(partidosAAsignarBase);

  const asignador1 = new AsignadorArbitros(
    usuarios,
    disponibilidades,
    designaciones,
    partidosAAsignar,
    categorias,
    lugares,
    equipos
  );

  const nuevasDesignaciones1 = asignador1.asignarArbitros();

  // user1 debería ser primer árbitro porque su nivel es suficiente
  expect(nuevasDesignaciones1!["partido1"].arbitro1?.nombre).toBe("Pedro");

  // Forzar nivel bajo en user1 
  usuarios.find(u => u.id === "user1")!.nivel = "Nivel I";

  const asignador = new AsignadorArbitros(
    usuarios,
    disponibilidades,
    designaciones,
    partidosAAsignar,
    categorias,
    lugares,
    equipos
  );

  const nuevasDesignaciones = asignador.asignarArbitros();

  // user1 no debería ser primer árbitro porque su nivel es insuficiente
   expect(nuevasDesignaciones!["partido1"].arbitro1?.nombre).not.toBe("Pedro");
});

// Test: asignación no debe repetir árbitro en partidos que se solapan en fecha y hora
test('no asigna el mismo árbitro en partidos simultáneos', () => {
  const usuarios = cloneDeep(usuariosBase);
  const disponibilidades = cloneDeep(disponibilidadesBase);
  const categorias = cloneDeep(categoriasBase);
  const lugares = cloneDeep(lugaresBase);
  const equipos = cloneDeep(equiposBase);
  const designaciones = cloneDeep(designacionesBase);
  const partidosAAsignar = cloneDeep(partidosAAsignarBase);

  // Modificar partido2 para que tenga misma fecha y hora que partido1
  partidosAAsignar[1].hora = partidosAAsignar[0].hora;

  const asignador = new AsignadorArbitros(
    usuarios,
    disponibilidades,
    designaciones,
    partidosAAsignar,
    categorias,
    lugares,
    equipos
  );

    const nuevasDesignaciones = asignador.asignarArbitros();
    console.dir(nuevasDesignaciones, { depth: null });

    expect(nuevasDesignaciones!["partido1"].arbitro1?.nombre).toBe("Pedro");
    expect(nuevasDesignaciones!["partido1"].arbitro2?.nombre).toBe("Incompleto");
    expect(nuevasDesignaciones!["partido1"].anotador).toBeUndefined();

    expect(nuevasDesignaciones!["partido2"].arbitro1?.nombre).toBe("Luis");
    expect(nuevasDesignaciones!["partido2"].arbitro2?.nombre).toBe("Incompleto");
    expect(nuevasDesignaciones!["partido2"].anotador).toBeUndefined();
 
});

describe("AsignadorArbitros Base Choice", () => {
    test("asigna árbitro1 con nivel suficiente y transporte", () => {
    const asignador = new AsignadorArbitros(cloneDeep(usuariosBase), cloneDeep(disponibilidadesBase), cloneDeep(designacionesBase), crearPartidos(1, "10:00:00", "Pabellón 1"), cloneDeep(categoriasBase), cloneDeep(lugaresBase), cloneDeep(equiposBase));
    expect(asignador.asignarArbitros()).not.toBeNull();
  });

  test("asigna árbitros con compañero que tiene transporte", () => {
    const usuarios = cloneDeep(usuariosBase);
    usuarios.forEach(u => u.transporte = false);
    usuarios[2].transporte = true;
    const asignador = new AsignadorArbitros(usuarios, cloneDeep(disponibilidadesBase), cloneDeep(designacionesBase), crearPartidos(1, "10:00:00", "Pabellón 1"), cloneDeep(categoriasBase), cloneDeep(lugaresBase), cloneDeep(equiposBase));
    expect(asignador.asignarArbitros()).not.toBeNull();
  });

  test("asigna árbitro con disponibilidad parcial", () => {
    const disponibilidades = cloneDeep(disponibilidadesBase);
    disponibilidades[0].franja1 = 0;
    disponibilidades[0].franja2 = 1;
    const asignador = new AsignadorArbitros(cloneDeep(usuariosBase), disponibilidades, cloneDeep(designacionesBase), crearPartidos(1, "12:00:00", "Pabellón 1"), cloneDeep(categoriasBase), cloneDeep(lugaresBase), cloneDeep(equiposBase));
    expect(asignador.asignarArbitros()).not.toBeNull();
  });

  test("no asigna árbitro sin disponibilidad", () => {
    const disponibilidades = cloneDeep(disponibilidadesBase);
    disponibilidades[0].franja1 = 3;
    disponibilidades[0].franja2 = 3;
    disponibilidades[0].franja3 = 3;
    disponibilidades[0].franja4 = 3;
    const asignador = new AsignadorArbitros(cloneDeep(usuariosBase), disponibilidades, cloneDeep(designacionesBase), crearPartidos(1, "10:00:00", "Pabellón 1"), cloneDeep(categoriasBase), cloneDeep(lugaresBase), cloneDeep(equiposBase));
    const resultado = asignador.asignarArbitros();
    expect(resultado!["partido1"].arbitro1?.nombre).not.toBe("Pedro");
  });


  test("asigna sin transporte pero vive <10km", () => {
    const usuarios = cloneDeep(usuariosBase);
    usuarios[0].transporte = false;
    const asignador = new AsignadorArbitros(usuarios, cloneDeep(disponibilidadesBase), cloneDeep(designacionesBase), crearPartidos(1, "10:00:00", "Pabellón 1"), cloneDeep(categoriasBase), cloneDeep(lugaresBase), cloneDeep(equiposBase));
    expect(asignador.asignarArbitros()).not.toBeNull();
    // Verifica que se asigna un árbitro sin transporte pero con cercanía
    expect(asignador.asignarArbitros()!["partido1"].arbitro1?.nombre).toBe("Pedro");
  });

  test("no asigna si sin transporte y sin cercanía", () => {
    const usuarios = cloneDeep(usuariosBase);
    usuarios[0].transporte = false;
    usuarios[0].latitud = 40;
    usuarios[0].longitud = -3;
    const asignador = new AsignadorArbitros(usuarios, cloneDeep(disponibilidadesBase), cloneDeep(designacionesBase), crearPartidos(1, "10:00:00", "Pabellón 1"), cloneDeep(categoriasBase), cloneDeep(lugaresBase), cloneDeep(equiposBase));
    const resultado = asignador.asignarArbitros();
    expect(resultado!["partido1"].arbitro1?.nombre).not.toBe("Pedro");
  });

  test("no asigna si partidos solapan", () => {
    const partidos = crearPartidos(1, "10:00:00", "Pabellón 1");
    partidos.push({ ...partidos[0], id: "partido2" });
    const asignador = new AsignadorArbitros(cloneDeep(usuariosBase), cloneDeep(disponibilidadesBase), { partido1: {}, partido2: {} }, partidos, cloneDeep(categoriasBase), cloneDeep(lugaresBase), cloneDeep(equiposBase));
    const resultado = asignador.asignarArbitros();
    const nombres = [resultado!["partido1"].arbitro1?.nombre, resultado!["partido2"].arbitro1?.nombre];
    expect(new Set(nombres).size).toBeGreaterThan(1);
    
  });

  test("rechaza partido con lugar inválido", () => {
    const partidos = crearPartidos(1, "10:00:00", "Lugar Inexistente");
    const asignador = new AsignadorArbitros(cloneDeep(usuariosBase), cloneDeep(disponibilidadesBase), cloneDeep(designacionesBase), partidos, cloneDeep(categoriasBase), cloneDeep(lugaresBase), cloneDeep(equiposBase));
    const resultado = asignador.asignarArbitros();
    expect(resultado).toBeNull();
  });

  test("prioridad alta favorece categorías urgentes", () => {
    const categorias = cloneDeep(categoriasBase);
    categorias[0].prioridad = 10;
    categorias[1].prioridad = 1;
    const partidos = [
      { id: "partido1", categoriaId: 1, equipoLocalId: "A", equipoVisitanteId: "B", fecha: "2025-05-31", hora: "10:00:00", lugar: "Pabellón 1" },
      { id: "partido2", categoriaId: 2, equipoLocalId: "C", equipoVisitanteId: "D", fecha: "2025-05-31", hora: "12:00:00", lugar: "Pabellón 2" }
    ];
    const asignador = new AsignadorArbitros(cloneDeep(usuariosBase), cloneDeep(disponibilidadesBase), { partido1: {}, partido2: {} }, partidos, categorias, cloneDeep(lugaresBase), cloneDeep(equiposBase));
    const resultado = asignador.asignarArbitros();
    const orden = Object.keys(resultado!);
    expect(orden[0]).toBe("partido2");
  });
});






