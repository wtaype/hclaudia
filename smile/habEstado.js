import $ from 'jquery';
import { db } from '../firebase/init.js';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Notificacion, getls, savels, removels } from './widev.js';
import { iniciarCheckInRapido } from './habRegistrar.js'; // ✅ AGREGAR ESTA LÍNEA

// ========================================
// 🏨 VARIABLES GLOBALES OPTIMIZADAS
// ========================================
let datosHabitaciones = [];
let correoActual = null;

// ========================================
// 🔄 FUNCIÓN PRINCIPAL OPTIMIZADA
// ========================================
export async function habitaciones() {
    try {
        // CACHE PRIMERO - AHORRO READS
        let habitacionesCache = getls('habitacionesPanel');
        
        if (!habitacionesCache) {
            const consultaFirebase = await getDocs(collection(db, 'habitaciones'));
            habitacionesCache = consultaFirebase.docs.map(documento => ({ 
                id: documento.id, 
                ...documento.data() 
            }));
            savels('habitacionesPanel', habitacionesCache, 300);
        }
        
        datosHabitaciones = habitacionesCache;
        llenarSelectHabitaciones();
        renderizarPanelHabitaciones();
        
    } catch (error) {
        console.error('Error cargar habitaciones:', error);
        $('#roomsGrid').html('<div class="loading-colabs">Error al cargar habitaciones</div>');
    }
}

// ========================================
// 🎨 RENDERIZAR PANEL DE HABITACIONES
// ========================================
function renderizarPanelHabitaciones() {
    const estadosInfo = {
        libre: { texto: 'Disponible', icono: 'fa-check-circle', color: '#10b981' },
        ocupado: { texto: 'Ocupado', icono: 'fa-user-friends', color: '#ef4444' },
        limpieza: { texto: 'Limpieza', icono: 'fa-broom', color: '#06b6d4' },
        fuera: { texto: 'Fuera', icono: 'fa-tools', color: '#f59e0b' }
    };

    const contenedorGrid = $('#roomsGrid');
    contenedorGrid.empty();

    if (datosHabitaciones.length === 0) {
        contenedorGrid.html('<div class="loading-colabs">No hay habitaciones registradas</div>');
        return;
    }

    datosHabitaciones.forEach(habitacion => {
        const estadoActual = habitacion.estado || 'libre';
        const infoEstado = estadosInfo[estadoActual];
        
        // FORMATEAR FECHA SEGURA
        const formatearFechaSafe = (timestamp) => {
            if (!timestamp) return '';
            try {
                if (timestamp.toDate) {
                    return timestamp.toDate().toLocaleDateString('es-PE');
                } else if (timestamp instanceof Date) {
                    return timestamp.toLocaleDateString('es-PE');
                } else if (typeof timestamp === 'string') {
                    return new Date(timestamp).toLocaleDateString('es-PE');
                }
                return '';
            } catch (error) {
                return '';
            }
        };

        const fechaCheckIn = formatearFechaSafe(habitacion.checkIn);
        
        const tarjetaHabitacion = $(`
            <div class="room-card ${estadoActual}" data-habitacion="${habitacion.numero}" style="--room-color: ${infoEstado.color}">
                <div class="room-header">
                    <div class="room-number">${habitacion.numero}</div>
                    <div class="status-badge">
                        <i class="fa-solid ${infoEstado.icono}"></i>
                        ${infoEstado.texto}
                    </div>
                </div>
                <div class="room-info">
                    <div><strong>${habitacion.tipo || 'Individual'}</strong></div>
                    <div>${habitacion.cliente || 'Sin huésped'}</div>
                    ${fechaCheckIn ? `<div><small>Check-in: ${fechaCheckIn}</small></div>` : ''}
                </div>
                
                <div class="estado-botones" style="
                    position: absolute; 
                    bottom: 0; 
                    left: 0; 
                    right: 0; 
                    padding: 0.8rem; 
                    background: rgba(255,255,255,0.95); 
                    display: flex; 
                    gap: 0.3rem; 
                    opacity: 0; 
                    transition: all 0.3s ease;
                ">
                    <button onclick="accionCheckIn('${habitacion.numero}')" 
                            class="btn-estado ${estadoActual === 'libre' ? 'activo' : ''}" 
                            style="background: #10b981; color: white; border: none; padding: 0.4rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; opacity: ${estadoActual === 'libre' ? '1' : '0.7'}; flex: 1;">
                        <i class="fa-solid fa-sign-in-alt"></i> Check-in
                    </button>
                    <button onclick="accionCheckOut('${habitacion.numero}')" 
                            class="btn-estado ${estadoActual === 'ocupado' ? 'activo' : ''}" 
                            style="background: #ef4444; color: white; border: none; padding: 0.4rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; opacity: ${estadoActual === 'ocupado' ? '1' : '0.7'}; flex: 1;">
                        <i class="fa-solid fa-sign-out-alt"></i> Check-out
                    </button>
                    <button onclick="accionLimpieza('${habitacion.numero}')" 
                            class="btn-estado ${estadoActual === 'limpieza' ? 'activo' : ''}" 
                            style="background: #06b6d4; color: white; border: none; padding: 0.4rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; opacity: ${estadoActual === 'limpieza' ? '1' : '0.7'}; flex: 1;">
                        <i class="fa-solid fa-broom"></i> Limpieza
                    </button>
                </div>
            </div>
        `);

        contenedorGrid.append(tarjetaHabitacion);
    });

    // MOSTRAR BOTONES AL HOVER
    $('.room-card').hover(
        function() {
            $(this).find('.estado-botones').css('opacity', '1');
        },
        function() {
            $(this).find('.estado-botones').css('opacity', '0');
        }
    );
}

// ========================================
// 🎯 ACCIONES DE HABITACIÓN OPTIMIZADAS
// ========================================
window.accionCheckIn = function(numeroHabitacion) {
    // ✅ AHORA FUNCIONA CORRECTAMENTE
    iniciarCheckInRapido(numeroHabitacion);
    
    // SCROLL AL FORMULARIO
    $('html, body').animate({
        scrollTop: $('.form-panel').offset().top - 100
    }, 800);
};

window.accionCheckOut = async function(numeroHabitacion) {
    const habitacion = datosHabitaciones.find(hab => hab.numero === numeroHabitacion);
    
    if (!habitacion) {
        Notificacion('Habitación no encontrada', 'error');
        return;
    }

    // PRIMERA CONFIRMACIÓN
    const confirmar1 = confirm(`¿Realizar Check-out de la habitación ${numeroHabitacion}?\n\nCliente: ${habitacion.cliente || 'Sin cliente'}\nTipo: ${habitacion.tipo || 'Individual'}`);
    if (!confirmar1) return;

    // SEGUNDA CONFIRMACIÓN CON OPCIONES
    const confirmar2 = confirm(`¿Confirmar Check-out y marcar como DISPONIBLE?\n\n⚠️ Esto:\n• Liberará la habitación\n• Mantendrá el registro en historial\n• Permitirá nuevas reservas\n\n¿Continuar?`);
    if (!confirmar2) return;

    try {
        // ACTUALIZAR ESTADO A LIBRE Y LIMPIAR DATOS DE HUÉSPED
        await updateDoc(doc(db, 'habitaciones', numeroHabitacion), {
            estado: 'libre',
            cliente: null,
            checkOut: new Date(),
            fechaActualizado: serverTimestamp()
        });
        
        // ACTUALIZAR CACHE LOCAL
        const habitacionIndex = datosHabitaciones.findIndex(hab => hab.numero === numeroHabitacion);
        if (habitacionIndex !== -1) {
            datosHabitaciones[habitacionIndex].estado = 'libre';
            datosHabitaciones[habitacionIndex].cliente = null;
            savels('habitacionesPanel', datosHabitaciones, 300);
        }
        
        renderizarPanelHabitaciones();
        llenarSelectHabitaciones();
        
        Notificacion(`✅ Check-out completado - Habitación ${numeroHabitacion} disponible`, 'success');
        
    } catch (error) {
        console.error('Error check-out:', error);
        Notificacion('Error al realizar check-out', 'error');
    }
};

window.accionLimpieza = async function(numeroHabitacion) {
    const habitacion = datosHabitaciones.find(hab => hab.numero === numeroHabitacion);
    
    if (!habitacion) {
        Notificacion('Habitación no encontrada', 'error');
        return;
    }

    const confirmar = confirm(`¿Marcar habitación ${numeroHabitacion} para LIMPIEZA?\n\nEsto desactivará temporalmente la habitación hasta que termine la limpieza.`);
    if (!confirmar) return;

    try {
        await updateDoc(doc(db, 'habitaciones', numeroHabitacion), {
            estado: 'limpieza',
            fechaActualizado: serverTimestamp()
        });
        
        // ACTUALIZAR CACHE LOCAL
        const habitacionIndex = datosHabitaciones.findIndex(hab => hab.numero === numeroHabitacion);
        if (habitacionIndex !== -1) {
            datosHabitaciones[habitacionIndex].estado = 'limpieza';
            savels('habitacionesPanel', datosHabitaciones, 300);
        }
        
        renderizarPanelHabitaciones();
        llenarSelectHabitaciones();
        
        Notificacion(`🧹 Habitación ${numeroHabitacion} en limpieza`, 'success');
        
    } catch (error) {
        console.error('Error limpieza:', error);
        Notificacion('Error al marcar para limpieza', 'error');
    }
};

// ========================================
// 🔄 LLENAR SELECT DE HABITACIONES
// ========================================
function llenarSelectHabitaciones() {
    const selectHabitaciones = $('#nhabitacion');
    if (selectHabitaciones.length === 0) return;
    
    // FILTRAR SOLO HABITACIONES DISPONIBLES PARA EL SELECT
    const habitacionesDisponibles = datosHabitaciones.filter(habitacion => habitacion.estado === 'libre');
    
    const opcionesSelect = '<option value="">Selecciona habitación...</option>' + 
        habitacionesDisponibles.map(habitacion => {
            return `<option value="${habitacion.numero}">Hab ${habitacion.numero} - ${habitacion.tipo || 'Individual'} (LIBRE)</option>`;
        }).join('');
    
    selectHabitaciones.html(opcionesSelect);
}

// ========================================
// 🔧 FUNCIONES DE ACTUALIZACIÓN
// ========================================
export async function actualizarHabitaciones() {
    removels('habitacionesPanel');
    await habitaciones();
    Notificacion('Panel actualizado', 'success');
}

export function establecerUsuario(correoUsuario) {
    correoActual = correoUsuario;
}