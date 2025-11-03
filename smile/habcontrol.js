import $ from 'jquery';
import { db } from '../firebase/init.js';
import { getDocs, doc, updateDoc, deleteDoc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { Notificacion, savels, getls, removels } from './widev.js';
import { actuHabs } from './habEstado.js';

// ========================================
// 🏨 VARIABLES GLOBALES DE HABITACIONES
// ========================================
let listadoHabitaciones = [];
let correoUsuario = null;

// ========================================
// 🔄 CARGAR HABITACIONES OPTIMIZADO
// ========================================
export async function cargarHabitaciones(usuario) {
    correoUsuario = usuario;
    
    try {
        // CACHE PRIMERO - AHORRO READS
        const cacheHabita = getls('habitacionesControl');
        if (cacheHabita && cacheHabita.length > 0) {
            listadoHabitaciones = cacheHabita;
            renderizarInterfaz();
            return;
        }
        
        // FIREBASE SOLO SI NO HAY CACHE
        const consultaBase = await getDocs(collection(db, 'habitaciones'));
        listadoHabitaciones = consultaBase.docs.map(documento => ({
            id: documento.id,
            ...documento.data()
        }));
        
        // GUARDAR CACHE 5 MINUTOS
        savels('habitacionesControl', listadoHabitaciones, 300);
        renderizarInterfaz();
        
    } catch (error) {
        console.error('Error carga:', error);
        Notificacion('Error al cargar habitaciones', 'error');
    }
}

// ========================================
// 🎨 RENDERIZAR INTERFAZ DE HABITACIONES
// ========================================
function renderizarInterfaz() {
    const htmlHabitaciones = `
        <table class="sales-table">
            <thead>
                <tr>
                    <th><i class="fas fa-hashtag"></i> Número</th>
                    <th><i class="fas fa-bed"></i> Tipo</th>
                    <th><i class="fas fa-user"></i> Cliente</th>
                    <th><i class="fas fa-calendar"></i> Check-in</th>
                    <th><i class="fas fa-calendar"></i> Check-out</th>
                    <th><i class="fas fa-info-circle"></i> Estado</th>
                    <th><i class="fas fa-cogs"></i> Acción</th>
                </tr>
            </thead>
            <tbody>
                ${listadoHabitaciones.length > 0 ? listadoHabitaciones.map(habitacion => crearFilaHabitacion(habitacion)).join('') : `
                    <tr><td colspan="7" style="text-align:center;padding:40px;">
                        <i class="fas fa-bed" style="font-size:48px;color:#ccc;margin-bottom:15px;"></i>
                        <p>No hay habitaciones registradas</p>
                        <button onclick="agregarNuevaHabitacion()" class="btn-refresh">
                            <i class="fas fa-plus"></i> Agregar Primera
                        </button>
                    </td></tr>
                `}
            </tbody>
        </table>
    `;
    
    $('#contenedorHabitaciones').html(htmlHabitaciones);
}

// ========================================
// 🏗️ CREAR FILA DE HABITACION
// ========================================
function crearFilaHabitacion(habitacion, editando = false) {
    // COLORES ESTADOS
    const coloresEstado = {
        'libre': '#10b981',
        'ocupado': '#ef4444', 
        'limpieza': '#06b6d4',
        'fuera': '#f59e0b'
    };
    
    // FORMATEAR FECHAS
    const formatearFecha = (timestamp) => {
        if (!timestamp) return '-';
        const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return fecha.toLocaleDateString('es-PE') + ' ' + fecha.toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'});
    };
    
    if (editando) {
        // FORMATEAR DATETIME-LOCAL PARA INPUTS
        const formatearDatetimeLocal = (timestamp) => {
            if (!timestamp) return '';
            try {
                const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
                return fecha.toISOString().slice(0, 16);
            } catch (error) {
                return '';
            }
        };

        return `
            <tr class="editing-row" data-id="${habitacion.id}">
                <td><strong>${habitacion.numero}</strong></td>
                <td>
                    <select id="tipoHabitacion" class="edit-input">
                        <option value="Individual" ${habitacion.tipo === 'Individual' ? 'selected' : ''}>Individual</option>
                        <option value="Doble" ${habitacion.tipo === 'Doble' ? 'selected' : ''}>Doble</option>
                        <option value="Triple" ${habitacion.tipo === 'Triple' ? 'selected' : ''}>Triple</option>
                        <option value="Matrimonial" ${habitacion.tipo === 'Matrimonial' ? 'selected' : ''}>Matrimonial</option>
                        <option value="Matrimonial superior" ${habitacion.tipo === 'Matrimonial superior' ? 'selected' : ''}>Matrimonial superior</option>
                    </select>
                </td>
                <td>
                    <input id="clienteHabitacion" type="text" class="edit-input" 
                           placeholder="Cliente" value="${habitacion.cliente || ''}" >
                </td>
                <td>
                    <input id="checkInHabitacion" type="datetime-local" class="edit-input" 
                           value="${formatearDatetimeLocal(habitacion.checkIn)}" >
                </td>
                <td>
                    <input id="checkOutHabitacion" type="datetime-local" class="edit-input" 
                           value="${formatearDatetimeLocal(habitacion.checkOut)}" >
                </td>
                <td>
                    <select id="estadoHabitacion" class="edit-input">
                        <option value="libre" ${habitacion.estado === 'libre' ? 'selected' : ''}>Libre</option>
                        <option value="ocupado" ${habitacion.estado === 'ocupado' ? 'selected' : ''}>Ocupado</option>
                        <option value="limpieza" ${habitacion.estado === 'limpieza' ? 'selected' : ''}>Limpieza</option>
                        <option value="fuera" ${habitacion.estado === 'fuera' ? 'selected' : ''}>Fuera</option>
                    </select>
                </td>
                <td class="actions-cell">
                    <button onclick="guardarCambiosHabitacion('${habitacion.id}')" class="btn-action btn-save">
                        <i class="fas fa-check"></i>
                    </button>
                    <button onclick="cancelarEdicionHabitacion()" class="btn-action btn-cancel">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
    }
    
    return `
        <tr data-id="${habitacion.id}">
            <td><strong>${habitacion.numero}</strong></td>
            <td>${habitacion.tipo || 'Individual'}</td>
            <td>${habitacion.cliente || '-'}</td>
            <td class="date-cell">${formatearFecha(habitacion.checkIn)}</td>
            <td class="date-cell">${formatearFecha(habitacion.checkOut)}</td>
            <td>
                <span class="badge" style="background:${coloresEstado[habitacion.estado] || '#666'};color:white;padding:4px 8px;border-radius:12px;">
                    ${(habitacion.estado || 'libre').toUpperCase()}
                </span>
            </td>
            <td class="actions-cell">
                <button onclick="editarHabitacionControl('${habitacion.id}')" class="btn-action btn-edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="eliminarHabitacionControl('${habitacion.id}')" class="btn-action btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

// ========================================
// 🎯 FUNCIONES GLOBALES OPTIMIZADAS
// ========================================
window.editarHabitacionControl = function(idHabitacion) {
    const habitacionSeleccionada = listadoHabitaciones.find(habitacion => habitacion.id === idHabitacion);
    if (!habitacionSeleccionada) return;
    
    $(`tr[data-id="${idHabitacion}"]`).replaceWith(crearFilaHabitacion(habitacionSeleccionada, true));
    $('#tipoHabitacion').focus();
    Notificacion('Editando habitación...', 'info');
};

window.cancelarEdicionHabitacion = function() {
    renderizarInterfaz();
    Notificacion('Edición cancelada', 'info');
};

window.guardarCambiosHabitacion = async function(idHabitacion) {
    const tipoNuevo = $('#tipoHabitacion').val();
    const clienteNuevo = $('#clienteHabitacion').val().trim();
    const checkInNuevo = $('#checkInHabitacion').val();
    const checkOutNuevo = $('#checkOutHabitacion').val();
    const estadoNuevo = $('#estadoHabitacion').val();
    
    if (!tipoNuevo) return Notificacion('Tipo obligatorio', 'error');
    
    try {
        const datosActualizacion = {
            tipo: tipoNuevo,
            cliente: clienteNuevo || null,
            estado: estadoNuevo,
            checkIn: checkInNuevo ? new Date(checkInNuevo) : null,
            checkOut: checkOutNuevo ? new Date(checkOutNuevo) : null,
            actualizadoPor: correoUsuario,
            fechaActualizado: serverTimestamp()
        };
        
        await updateDoc(doc(db, 'habitaciones', idHabitacion), datosActualizacion);
        
        // LIMPIAR CACHE Y RECARGAR
        removels('habitacionesControl');
        await cargarHabitaciones(correoUsuario);
        
        // ACTUALIZAR TARJETAS EN SMILE.JS
        await actuHabs();
        
        Notificacion('Habitación actualizada', 'success');
        
    } catch (error) {
        console.error('Error guardar:', error);
        Notificacion('Error al guardar', 'error');
    }
};

window.eliminarHabitacionControl = async function(idHabitacion) {
    const habitacionBorrar = listadoHabitaciones.find(habitacion => habitacion.id === idHabitacion);
    if (!habitacionBorrar) return;
    
    if (!confirm(`¿Eliminar habitación ${habitacionBorrar.numero}?\n\nEsta acción no se puede deshacer.`)) return;
    
    try {
        await deleteDoc(doc(db, 'habitaciones', idHabitacion));
        removels('habitacionesControl');
        await cargarHabitaciones(correoUsuario);
        Notificacion('Habitación eliminada', 'success');
    } catch (error) {
        console.error('Error eliminar:', error);
        Notificacion('Error al eliminar', 'error');
    }
};

window.agregarNuevaHabitacion = function() {
    const numeroHabitacion = prompt('Número de habitación (ej: 101, 102, 201):');
    if (!numeroHabitacion || !numeroHabitacion.trim()) return;
    
    const numeroLimpio = numeroHabitacion.trim();
    
    // VERIFICAR EXISTENCIA
    if (listadoHabitaciones.some(habitacion => habitacion.numero === numeroLimpio || habitacion.id === numeroLimpio)) {
        return Notificacion('Habitación ya existe', 'error');
    }
    
    // AGREGAR FILA NUEVA
    const filaNueva = `
        <tr class="editing-row new-habitacion-row">
            <td><strong>${numeroLimpio}</strong></td>
            <td>
                <select id="tipoHabitacion" class="edit-input">
                    <option value="Individual">Individual</option>
                    <option value="Doble">Doble</option>
                    <option value="Triple">Triple</option>
                    <option value="Matrimonial">Matrimonial</option>
                    <option value="Matrimonial superior">Matrimonial superior</option>
                </select>
            </td>
            <td><input id="clienteHabitacion" type="text" class="edit-input" placeholder="Cliente (opcional)"></td>
            <td><input id="checkInHabitacion" type="datetime-local" class="edit-input"></td>
            <td><input id="checkOutHabitacion" type="datetime-local" class="edit-input"></td>
            <td>
                <select id="estadoHabitacion" class="edit-input">
                    <option value="libre" selected>Libre</option>
                    <option value="ocupado">Ocupado</option>
                    <option value="limpieza">Limpieza</option>
                    <option value="fuera">Fuera de Servicio</option>
                </select>
            </td>
            <td class="actions-cell">
                <button onclick="guardarNuevaHabitacionControl('${numeroLimpio}')" class="btn-action btn-save">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="cancelarNuevaHabitacion()" class="btn-action btn-cancel">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `;
    
    if (listadoHabitaciones.length > 0) {
        $('tbody').append(filaNueva);
    } else {
        $('tbody').html(filaNueva);
    }
    
    $('#tipoHabitacion').focus();
    Notificacion('Agregando nueva habitación...', 'info');
};

window.guardarNuevaHabitacionControl = async function(numeroHabitacion) {
    const tipoNuevo = $('#tipoHabitacion').val();
    const clienteNuevo = $('#clienteHabitacion').val().trim();
    const checkInNuevo = $('#checkInHabitacion').val();
    const checkOutNuevo = $('#checkOutHabitacion').val();
    const estadoNuevo = $('#estadoHabitacion').val();
    
    if (!tipoNuevo) return Notificacion('Tipo obligatorio', 'error');
    
    try {
        const datosNueva = {
            numero: numeroHabitacion,
            tipo: tipoNuevo,
            cliente: clienteNuevo || null,
            estado: estadoNuevo || 'libre',
            checkIn: checkInNuevo ? new Date(checkInNuevo) : null,
            checkOut: checkOutNuevo ? new Date(checkOutNuevo) : null,
            registradoPor: correoUsuario,
            actualizadoPor: correoUsuario,
            fechaActualizado: serverTimestamp()
        };
        
        await setDoc(doc(db, 'habitaciones', numeroHabitacion), datosNueva);
        
        removels('habitacionesControl');
        await cargarHabitaciones(correoUsuario);
        
        // ACTUALIZAR TARJETAS EN SMILE.JS
        await actualizarHabitaciones();
        
        Notificacion(`Habitación ${numeroHabitacion} creada`, 'success');
        
    } catch (error) {
        console.error('Error crear:', error);
        Notificacion('Error al crear habitación', 'error');
    }
};

window.cancelarNuevaHabitacion = function() {
    if (listadoHabitaciones.length > 0) {
        $('.new-habitacion-row').remove();
    } else {
        renderizarInterfaz();
    }
    Notificacion('Nueva habitación cancelada', 'info');
};

window.actualizarHabitacionesFromDB = async function() {
    removels('habitacionesControl');
    await cargarHabitaciones(correoUsuario);
    Notificacion('Habitaciones actualizadas', 'success');
};

// ========================================
// 🏨 LLENAR SELECT DE HABITACIONES
// ========================================
export function llenarSelectHabitaciones() {
    const habitacionesCache = getls('habitacionesControl') || [];
    
    const opcionesSelect = '<option value="">Selecciona habitación...</option>' + 
        habitacionesCache.map(habitacion => `
            <option value="${habitacion.numero}">Hab ${habitacion.numero} - ${habitacion.tipo} (${habitacion.estado})</option>
        `).join('');
    
    $('#nhabitacion').html(opcionesSelect);
}