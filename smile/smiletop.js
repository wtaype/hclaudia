import './smiletop.css'
import $ from 'jquery';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { auth, db } from '../firebase/init.js';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDocs, query, collection, where } from "firebase/firestore";
import { Mensaje, Notificacion, savels, getls, wiTema } from './widev.js';
import { cargarHabitaciones } from './habcontrol.js';

// ========================================
// 🔐 AUTENTICACION Y VARIABLES GLOBALES
// ========================================
let usuarioActual = null;

onAuthStateChanged(auth, async user => {
  if(!user) return window.location.href = '/';
  usuarioActual = user;

  try{
    const datosUsuario = getls('wiSmile');
    if(datosUsuario) return contenidoPrincipal(datosUsuario), wiTema(db, usuarioActual);

    const busqueda = await getDocs(query(collection(db, 'smiles'), where('usuario', '==', user.displayName)));
    const datosCompletos = busqueda.docs[0].data(); 
    savels('wiSmile', datosCompletos, 450); 
    contenidoPrincipal(datosCompletos); 
    wiTema(db, usuarioActual);
  }catch(error){console.error(error)}
});

// CERRAR SESION
$(document).on('click', '.bt_salir', async () => {
  await signOut(auth); 
  window.location.href = '/';
  try{localStorage.clear();}catch(_){Object.keys(localStorage).forEach(clave=>localStorage.removeItem(clave));}
});

// ========================================
// 🏨 CONTENIDO PRINCIPAL
// ========================================
function contenidoPrincipal(datosUsuario){
    Mensaje('Bienvenido ' + datosUsuario.nombre + '!');

    $('.app').html(`
        <header class="admin-header">
            <div class="header-left">
                <div class="logo">
                    <i class="fas fa-hotel"></i>
                    <h1>Gestión HClaudia</h1>
                </div>
            </div>
            <div class="header-right">
                <div class="witemas"></div>
                <div class="user-info">
                    <img src="${datosUsuario.imagen || './smile.png'}" alt="Avatar" class="user-avatar">
                    <span>${datosUsuario.nombre || 'Admin'}</span>
                </div>
                <button class="btn-logout bt_salir"><i class="fas fa-sign-out-alt"></i> Salir</button>
            </div>
        </header>

        <div class="content-grid">
            <main class="main-content">
                <section class="table-section">
                    <div class="table-header">
                        <h2><i class="fas fa-bed"></i> Habitaciones</h2>
                        <div class="table-stats">
                            <button onclick="actualizarHabitacionesFromDB()" class="btn-refresh">
                                <i class="fas fa-sync"></i> Actualizar
                            </button>
                            <button onclick="agregarNuevaHabitacion()" class="btn-refresh">
                                <i class="fas fa-plus"></i> Agregar
                            </button>
                        </div>
                    </div>
                    <div id="contenedorHabitaciones">
                        <div class="loading-state">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Cargando...</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    `);

    inicializarSistema();
}

// ========================================
// 🔄 INICIALIZAR SISTEMA
// ========================================
async function inicializarSistema() {
    try {
        await cargarHabitaciones(usuarioActual.email);
        Notificacion('Sistema iniciado', 'success');
    } catch (error) {
        console.error('Error:', error);
        Notificacion('Error al inicializar', 'error');
    }
}