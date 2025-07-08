import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import LoginView from '../components/login/LoginView';
import DesignacionesView from '../components/designaciones/DesignacionesView';
import PerfilView from '../components/perfil/PerfilView';
import UsuariosView from '../components/gestion_usuarios/UsuariosView';
import CrearUsuario from '../components/gestion_usuarios/CrearUsuario';
import ModificarUsuario from '../components/gestion_usuarios/ModificarUsuario';
import PartidosView from '../components/gestion_partidos/PartidosView';
import CrearPartido from '../components/gestion_partidos/CrearPartido';
import ModificarPartido from '../components/gestion_partidos/ModificarPartido';
import DisponibilidadView from '../components/disponibilidad/DisponibilidadView';
import PanelDesignacionesView from '../components/gestion_designaciones/PanelDesignacionesView';
import DetallePartido from "../components/gestion_partidos/DetallesPartidoView";
import HistorialDesignacionesView from '../components/designaciones/HistorialDesignacionesView';


const Router = () => {
    return (
        <HashRouter>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<LoginView />} />
                <Route path="/misDesignaciones" element={<DesignacionesView />} />
                <Route path="/miPerfil" element={<PerfilView />} /> 
                <Route path="/miDisponibilidad" element={<DisponibilidadView />} />
                <Route path="/miHistorial" element={<HistorialDesignacionesView />} />
                <Route path="/gestionUsuarios/usuariosView" element={<UsuariosView />} />
                <Route path="/gestionUsuarios/crearUsuario" element={<CrearUsuario open={true} onClose={() => {}} onSave={() => {}} />} />
                <Route path="/gestionUsuarios/modificarUsuario" element={
                    <ModificarUsuario
                        open={true}
                        onClose={() => { }}
                        onUpdate={() => { }}
                        usuario={{
                            id: "",
                            nombre: "",
                            primerApellido: "",
                            segundoApellido: "",
                            fechaNacimiento: "",
                            nivel: "",
                            clubVinculadoId: "",
                            licencia: "",
                            email: "",
                            username: "",
                            password: "",
                            esAdmin: false,
                            direccion: "",
                            pais: "",
                            region: "",
                            ciudad: "",
                            codigoPostal: ""
                        }}
                    />
                } />
                <Route path="/gestionPartidos/partidosView" element={<PartidosView />} />
                <Route path="/gestionPartidos/crearPartido" element={<CrearPartido open={true} onClose={() => {}} onSave={() => {}} />} />
                <Route path="/gestionPartidos/modificarPartido" element={<ModificarPartido open={true} onClose={() => { } } onUpdate={() => { } } />} />
                <Route path="/detallesPartido/:id" element={<DetallePartido />} />
                <Route path="/gestionDesignaciones/panelDesignaciones" element={<PanelDesignacionesView />} />
        
            </Routes>
        </HashRouter>
    );
};

export default Router;
