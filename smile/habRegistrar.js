import $ from 'jquery';
import { db } from '../firebase/init.js';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Notificacion } from './widev.js';
import { actualizarHabitaciones } from './habEstado.js';

// ========================================
// 🏨 VARIABLES GLOBALES DE REGISTRO
// ========================================
let usuarioActual = null;

// ========================================
// 🎯 CONFIGURAR SISTEMA DE REGISTRO
// ========================================
export function configurarRegistroHabitaciones(usuario) {
    usuarioActual = usuario;
    configurarEventosFormulario();
    configurarFechasAutomaticas();
}

// ========================================
// 📝 CONFIGURAR EVENTOS DEL FORMULARIO
// ========================================
function configurarEventosFormulario() {
    // EVENTO SUBMIT DEL FORMULARIO
    $('#regForm').off('submit').on('submit', async function(evento) {
        evento.preventDefault();
        await procesarRegistroHabitacion();
    });

    // AUTO-CALCULAR FECHAS AL CAMBIAR NOCHES
    $('#diasReservados').on('input', calcularFechas);
    $('#checkIn').on('change', calcularFechas);

    // VALIDACIONES EN TIEMPO REAL
    $('#numDocumento').on('input', validarDocumento);
    $('#precio').on('input', validarPrecio);
    $('#checkIn, #checkOut').on('change', validarFechas);
}

// ========================================
// 📅 CONFIGURAR FECHAS AUTOMÁTICAS
// ========================================
function configurarFechasAutomaticas() {
    const fechaHoy = new Date();
    const checkInDefecto = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), fechaHoy.getDate(), 14, 0);
    const checkOutDefecto = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), fechaHoy.getDate() + 1, 12, 0);
    
    // ESTABLECER FECHAS POR DEFECTO CON HORAS HOTEL
    if (!$('#checkIn').val()) {
        $('#checkIn').val(checkInDefecto.toISOString().slice(0, 16));
    }
    
    if (!$('#checkOut').val()) {
        $('#checkOut').val(checkOutDefecto.toISOString().slice(0, 16));
    }
}

// ========================================
// 🧮 CALCULAR FECHAS AUTOMÁTICAMENTE
// ========================================
function calcularFechas() {
    const checkInValor = $('#checkIn').val();
    const diasReservados = parseInt($('#diasReservados').val()) || 1;
    
    if (checkInValor) {
        const fechaCheckIn = new Date(checkInValor);
        const fechaCheckOut = new Date(fechaCheckIn);
        fechaCheckOut.setDate(fechaCheckOut.getDate() + diasReservados);
        fechaCheckOut.setHours(12, 0); // Check-out a las 12:00
        
        $('#checkOut').val(fechaCheckOut.toISOString().slice(0, 16));
    }
}

// ========================================
// ✅ VALIDACIONES EN TIEMPO REAL
// ========================================
function validarDocumento() {
    const tipoDoc = $('#tipoDocumento').val();
    const numeroDoc = $('#numDocumento').val();
    
    if (tipoDoc === 'DNI' && numeroDoc.length === 8) {
        $('#numDocumento').css('border-color', '#10b981');
    } else if (tipoDoc === 'Pasaporte' && numeroDoc.length >= 6) {
        $('#numDocumento').css('border-color', '#10b981');
    } else {
        $('#numDocumento').css('border-color', '#ef4444');
    }
}

function validarPrecio() {
    const precio = parseFloat($('#precio').val());
    
    if (precio > 0 && precio <= 1000) {
        $('#precio').css('border-color', '#10b981');
    } else {
        $('#precio').css('border-color', '#ef4444');
    }
}

function validarFechas() {
    const checkIn = new Date($('#checkIn').val());
    const checkOut = new Date($('#checkOut').val());
    
    if (checkOut > checkIn) {
        $('#checkIn, #checkOut').css('border-color', '#10b981');
    } else {
        $('#checkOut').css('border-color', '#ef4444');
    }
}

// ========================================
// 💾 PROCESAR REGISTRO DE HABITACIÓN
// ========================================
async function procesarRegistroHabitacion() {
    try {
        // MOSTRAR LOADING
        $('.btn-save').html('<i class="fa-solid fa-spinner fa-spin"></i> Guardando...');
        $('.btn-save').prop('disabled', true);

        // RECOPILAR DATOS DEL FORMULARIO
        const datosRegistro = recopilarDatosFormulario();
        
        // VALIDAR DATOS
        if (!validarDatosCompletos(datosRegistro)) {
            return;
        }

        // GUARDAR EN FIREBASE - COLECCIÓN REGISTROS
        const docRegistro = await addDoc(collection(db, 'registros'), {
            ...datosRegistro,
            fechaRegistro: serverTimestamp(),
            registradoPor: usuarioActual.email,
            estado: 'activo'
        });

        // ACTUALIZAR HABITACIÓN - MARCAR COMO OCUPADA
        await updateDoc(doc(db, 'habitaciones', datosRegistro.numeroHabitacion), {
            estado: 'ocupado',
            cliente: datosRegistro.nombreCliente,
            checkIn: new Date(datosRegistro.checkIn),
            checkOut: new Date(datosRegistro.checkOut),
            actualizadoPor: usuarioActual.email,
            fechaActualizado: serverTimestamp()
        });

        // LIMPIAR FORMULARIO
        limpiarFormulario();
        
        // ACTUALIZAR PANEL DE HABITACIONES
        await actualizarHabitaciones();
        
        Notificacion(`✅ Check-in completado - Habitación ${datosRegistro.numeroHabitacion}`, 'success');

    } catch (error) {
        console.error('Error registro:', error);
        Notificacion('Error al guardar registro', 'error');
    } finally {
        // RESTAURAR BOTÓN
        $('.btn-save').html('<i class="fa-solid fa-check-circle"></i> Guardar');
        $('.btn-save').prop('disabled', false);
    }
}

// ========================================
// 📋 RECOPILAR DATOS DEL FORMULARIO
// ========================================
function recopilarDatosFormulario() {
    return {
        numeroHabitacion: $('#nhabitacion').val(),
        precio: parseFloat($('#precio').val()),
        estadoPago: $('#estadoPago').val(),
        nombreCliente: $('#nombreCliente').val().trim(),
        tipoDocumento: $('#tipoDocumento').val(),
        numDocumento: $('#numDocumento').val().trim(),
        diasReservados: parseInt($('#diasReservados').val()),
        checkIn: $('#checkIn').val(),
        checkOut: $('#checkOut').val(),
        moneda: $('#moneda').val(),
        metodoPago: $('#metodoPago').val(),
        desayuno: $('#desayuno').val(),
        carroPlaca: $('#carroPlaca').val().trim() || null,
        celular: $('#celular').val().trim() || null,
        qPersonas: $('#qPersonas').val().trim(),
        comentario: $('#comentario').val().trim() || null
    };
}

// ========================================
// ✅ VALIDAR DATOS COMPLETOS
// ========================================
function validarDatosCompletos(datos) {
    // VALIDACIONES REQUERIDAS
    if (!datos.numeroHabitacion) {
        Notificacion('Selecciona una habitación', 'error');
        $('#nhabitacion').focus();
        return false;
    }

    if (!datos.precio || datos.precio <= 0) {
        Notificacion('Ingresa un precio válido', 'error');
        $('#precio').focus();
        return false;
    }

    if (!datos.nombreCliente) {
        Notificacion('Ingresa el nombre del cliente', 'error');
        $('#nombreCliente').focus();
        return false;
    }

    if (!datos.numDocumento) {
        Notificacion('Ingresa el número de documento', 'error');
        $('#numDocumento').focus();
        return false;
    }

    if (!datos.checkIn) {
        Notificacion('Selecciona fecha y hora de check-in', 'error');
        $('#checkIn').focus();
        return false;
    }

    if (!datos.checkOut) {
        Notificacion('Selecciona fecha y hora de check-out', 'error');
        $('#checkOut').focus();
        return false;
    }

    // VALIDAR QUE CHECKOUT SEA POSTERIOR AL CHECKIN
    if (new Date(datos.checkOut) <= new Date(datos.checkIn)) {
        Notificacion('El check-out debe ser posterior al check-in', 'error');
        $('#checkOut').focus();
        return false;
    }

    return true;
}

// ========================================
// 🧹 LIMPIAR FORMULARIO
// ========================================
function limpiarFormulario() {
    $('#regForm')[0].reset();
    
    // RESTAURAR VALORES POR DEFECTO
    $('#estadoPago').val('pagado');
    $('#tipoDocumento').val('DNI');
    $('#diasReservados').val('1');
    $('#moneda').val('Soles');
    $('#metodoPago').val('Tarjeta');
    $('#desayuno').val('si');
    
    // CONFIGURAR FECHAS AUTOMÁTICAS
    configurarFechasAutomaticas();
    
    // ENFOCAR PRIMER CAMPO
    $('#nhabitacion').focus();
}

// ========================================
// 🎯 FUNCIÓN PARA CHECK-IN RÁPIDO
// ========================================
export function iniciarCheckInRapido(numeroHabitacion) {
    // PRELLENAR HABITACIÓN
    $('#nhabitacion').val(numeroHabitacion);
    
    // CONFIGURAR FECHAS CON HORA ACTUAL
    const ahora = new Date();
    const checkInAhora = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), ahora.getHours(), ahora.getMinutes());
    const checkOutManana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 12, 0);
    
    $('#checkIn').val(checkInAhora.toISOString().slice(0, 16));
    $('#checkOut').val(checkOutManana.toISOString().slice(0, 16));
    
    // ENFOCAR PRECIO
    $('#precio').focus();
    
    Notificacion(`Check-in iniciado para habitación ${numeroHabitacion}`, 'info');
}