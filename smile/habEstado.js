import $ from 'jquery';
import { db } from '../firebase/init.js';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Notificacion, getls, savels, removels, fechaCheck } from './widev.js';
import { iniciarCheckIn, verReg, editReg } from './habRegistrar.js';

let habitaciones = [];

export async function habs() {
  try {
    let cache = getls('habsPanel');
    
    if (!cache) {
      const consulta = await getDocs(collection(db, 'habitaciones'));
      cache = consulta.docs.map(d => ({ id: d.id, ...d.data() }));
      savels('habsPanel', cache, 300);
    }
    
    habitaciones = cache;
    llenarSelectHabitaciones();
    renderizarPanel();
    
  } catch (error) {
    console.error('Error cargar habitaciones:', error);
    $('#roomsGrid').html('<div class="loading-colabs">Error al cargar habitaciones</div>');
  }
}

const renderizarPanel = () => {
  const estados = {
    libre: { texto: 'Disponible', clase: 'libre' },
    ocupado: { texto: 'Ocupado', clase: 'ocupado' },
    limpieza: { texto: 'En limpieza', clase: 'limpieza' },
    fuera: { texto: 'Fuera de servicio', clase: 'fuera' }
  };

  const contenedor = $('#roomsGrid').empty();

  if (!habitaciones.length) {
    contenedor.html('<div class="loading-colabs">Sin habitaciones registradas</div>');
    return;
  }

  habitaciones.forEach(hab => {
    const estado = hab.estado || 'libre';
    const info = estados[estado];
    const fechaEntrada = fechaCheck(hab.checkIn, 'full');
    
    const tarjeta = $(`
      <div class="room-card ${info.clase}" data-hab="${hab.numero}">
        <div class="room-header"> 
          <div class="room-numero">${hab.numero}</div>
          <div class="room-tipo">${hab.tipo || 'Estándar'}</div>
          <div class="room-estado-dot"></div>
        </div>
        <div class="room-body">
          <div class="room-cliente">${hab.cliente || info.texto}</div>
          <div class="room-check">${fechaEntrada}</div>
        </div>
        <div class="room-actions">
          ${generarBotones(hab.numero, estado, hab.registroId)}
        </div>
      </div>
    `);

    contenedor.append(tarjeta);
  });
};

const generarBotones = (numero, estado, registroId) => {
  const botones = [];
  
  if (estado === 'ocupado' && registroId) {
    botones.push(`<button onclick="verRegistro('${registroId}')" class="btn-action btn-view" title="Ver detalles"><i class="fa-solid fa-eye"></i></button>`);
    botones.push(`<button onclick="editarRegistro('${registroId}')" class="btn-action btn-edit" title="Editar"><i class="fa-solid fa-edit"></i></button>`);
    botones.push(`<button onclick="hacerCheckOut('${numero}')" class="btn-action btn-checkout" title="Check-out"><i class="fa-solid fa-sign-out-alt"></i></button>`);
  }
  
  if (estado === 'libre') {
    botones.push(`<button onclick="hacerCheckIn('${numero}')" class="btn-action btn-checkin" title="Check-in"><i class="fa-solid fa-sign-in-alt"></i></button>`);
  }
  
  botones.push(`<button onclick="marcarLimpieza('${numero}')" class="btn-action btn-cleaning ${estado === 'limpieza' ? 'active' : ''}" title="Limpieza"><i class="fa-solid fa-broom"></i></button>`);
  
  return botones.join('');
};

window.verRegistro = (id) => {
  verReg(id);
  $('html, body').animate({ scrollTop: $('.form-panel').offset().top - 100 }, 800);
};

window.editarRegistro = (id) => {
  editReg(id);
  $('html, body').animate({ scrollTop: $('.form-panel').offset().top - 100 }, 800);
};

window.hacerCheckIn = (numero) => {
  iniciarCheckIn(numero);
  $('html, body').animate({ scrollTop: $('.form-panel').offset().top - 100 }, 800);
};

window.hacerCheckOut = async (numero) => {
  const habitacion = habitaciones.find(h => h.numero === numero);
  if (!habitacion) return Notificacion('Habitación no encontrada', 'error');

  if (!confirm(`¿Realizar check-out de la habitación ${numero}?\n\nCliente: ${habitacion.cliente || 'Sin cliente'}`)) return;

  try {
    await updateDoc(doc(db, 'habitaciones', numero), {
      estado: 'libre',
      cliente: null,
      checkIn: null,
      checkOut: new Date(),
      registroId: null,
      fechaActualizado: serverTimestamp()
    });
    
    if (habitacion.registroId) {
      await updateDoc(doc(db, 'hotelventas', habitacion.registroId), {
        estado: 'checkout',
        fechaCheckout: serverTimestamp()
      });
    }
    
    await actuHabs();
    Notificacion(`✅ Check-out exitoso - Hab ${numero}`, 'success');
    
  } catch (error) {
    console.error('Error en check-out:', error);
    Notificacion('Error al realizar check-out', 'error');
  }
};

window.marcarLimpieza = async (numero) => {
  const habitacion = habitaciones.find(h => h.numero === numero);
  if (!habitacion) return Notificacion('Habitación no encontrada', 'error');

  const nuevoEstado = habitacion.estado === 'limpieza' ? 'libre' : 'limpieza';
  const mensaje = nuevoEstado === 'limpieza' ? 'EN LIMPIEZA' : 'DISPONIBLE';
  
  if (!confirm(`¿Marcar habitación ${numero} como ${mensaje}?`)) return;

  try {
    await updateDoc(doc(db, 'habitaciones', numero), {
      estado: nuevoEstado,
      fechaActualizado: serverTimestamp()
    });
    
    await actuHabs();
    Notificacion(`${nuevoEstado === 'limpieza' ? '🧹' : '✅'} Hab ${numero} marcada como ${mensaje}`, 'success');
    
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    Notificacion('Error al cambiar estado', 'error');
  }
};

const llenarSelectHabitaciones = () => {
  const select = $('#nhabitacion');
  if (!select.length) return;
  
  const opciones = '<option value="">Selecciona...</option>' + 
    habitaciones.map(h => `<option value="${h.numero}">Hab ${h.numero} - ${h.tipo || 'Estándar'} ${h.estado !== 'libre' ? `(${h.estado})` : ''}</option>`).join('');
  
  select.html(opciones);
};

export async function actuHabs() {
  removels('habsPanel');
  await habs();
}