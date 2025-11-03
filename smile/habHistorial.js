import $ from 'jquery';
import { db } from '../firebase/init.js';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Notificacion, getls, savels, removels, fechaCheck, fechaPeru } from './widev.js';
import { verReg, editReg } from './habRegistrar.js';
import { actuHabs } from './habEstado.js';

let regs = [], regsFil = [], pagActual = 1, regsPag = 10, usrs = [];

export function configHist() { cargarHist(); initFils(); }
export async function actuHist() { removels('histRegs'); await cargarHist(); }

async function cargarHist() {
  try {
    await cargarUsrs();
    const cons = await getDocs(query(collection(db, 'hotelventas'), orderBy('fechaRegistro', 'desc'), limit(100)));
    const cache = cons.docs.map(d => ({ id: d.id, ...d.data() }));
    savels('histRegs', cache, 5);
    regs = regsFil = cache;
    renderTab();
    actuStats();
    llenarColab();
  } catch (e) {
    console.error('Error cargar historial:', e);
    $('#tabBody').html('<tr><td colspan="10" style="text-align:center">Error al cargar</td></tr>');
  }
}

async function cargarUsrs() {
  try {
    let cache = getls('usuariosSmile');
    if (!cache) {
      const cons = await getDocs(query(collection(db, 'smiles'), where('participa', '==', 'si')));
      cache = cons.docs.map(d => ({ id: d.id, ...d.data() }));
      savels('usuariosSmile', cache, 600);
    }
    usrs = cache;
  } catch (e) { console.error('Error cargar usuarios:', e); usrs = []; }
}

const getNombre = (usuario) => {
  if (!usuario) return 'N/A';
  const usr = usrs.find(u => u.usuario === usuario); // 🔥 Buscar por displayName
  return usr?.nombre || usuario;
};


const initFils = () => {
  $('#filCant').on('change', () => { regsPag = $('#filCant').val() === 'all' ? regsFil.length : parseInt($('#filCant').val()); pagActual = 1; renderTab(); });
  $('#filCola').on('change', () => { const col = $('#filCola').val(); regsFil = col ? regs.filter(r => r.registradoPor === col || r.actualizadoPor === col) : regs; pagActual = 1; renderTab(); actuStats(); });
  $('#monthFilter').on('change', () => { const mes = $('#monthFilter').val(); if (!mes) { regsFil = regs; } else { const [año, mesNum] = mes.split('-'); regsFil = regs.filter(r => { if (!r.fechaRegistro) return false; const f = r.fechaRegistro.toDate ? r.fechaRegistro.toDate() : new Date(r.fechaRegistro); return f.getFullYear() == año && (f.getMonth() + 1) == parseInt(mesNum); }); } pagActual = 1; renderTab(); actuStats(); });
};

const renderTab = () => {
  // 📊 CALCULAR PAGINACIÓN
  const inicio = (pagActual - 1) * regsPag;
  const fin = regsPag === regsFil.length ? regsFil.length : inicio + regsPag;
  const regsPagina = regsFil.slice(inicio, fin);

  // ❌ SIN REGISTROS
  if (!regsPagina.length) {
    $('#tabBody').html(`
      <tr>
        <td colspan="10" style="text-align:center;padding:2vh;color:var(--bg2)">
          <i class="fa-solid fa-inbox" style="font-size:2rem;margin-bottom:1rem;display:block"></i>
          Sin registros para mostrar
        </td>
      </tr>
    `);
    $('#pagBox').empty();
    return;
  }

  // ✅ RENDERIZAR TABLA
  const filas = regsPagina.map(reg => {
    // 🔍 BUSCAR USUARIO
    const usuario = usrs.find(u => u.usuario === reg.registradoPor);
    const nombreUsuario = getNombre(reg.registradoPor);
    const nombreActualizador = getNombre(reg.actualizadoPor);
    
    // 💰 SÍMBOLO DE MONEDA
    const monedaSimbolo = reg.moneda === 'Soles' ? 'S/' : '$';
    
    // 📅 FECHA CHECKOUT (PRIORIDAD: fechaCheckout > checkOut)
    const fechaSalida = reg.fechaCheckout 
      ? fechaCheck(reg.fechaCheckout, 'full') 
      : fechaCheck(reg.checkOut, 'full');
    
    // 🏷️ BADGE ESTADO DE PAGO
    const estadoClase = reg.estadoPago === 'pagado' ? 'success' : 'warning';
    const estadoTexto = reg.estadoPago === 'pagado' ? 'Pagado' : 'Deuda';
    
    // 📝 TOOLTIP USUARIO
    const tooltipUsuario = `Registrado: ${reg.registradoPor || 'N/A'}${
      reg.actualizadoPor && reg.actualizadoPor !== reg.registradoPor 
        ? '\nActualizado: ' + reg.actualizadoPor 
        : ''
    }`;
    
    // 🎨 MOSTRAR ACTUALIZADOR SI ES DIFERENTE
    const infoActualizador = reg.actualizadoPor && reg.actualizadoPor !== reg.registradoPor
      ? `<br><small style="color:var(--alert)">✏️ ${nombreActualizador}</small>`
      : '';

    return `
      <tr>
        <td>${fechaCheck(reg.fechaRegistro, 'fecha')}</td>
        
        <td class="user-cell" title="${tooltipUsuario}">
          ${usuario ? `<img src="${usuario.imagen || '/smile.png'}" class="avatar-small" alt="${usuario.nombre}">` : ''}
          <strong>${nombreUsuario}</strong>
          ${infoActualizador}
        </td>
        
        <td>${fechaCheck(reg.checkIn, 'full')}</td>
        <td>${fechaSalida}</td>
        <td>${reg.nombreCliente}</td>
        <td>${reg.tipoDocumento} ${reg.numDocumento}</td>
        <td>Hab ${reg.nhabitacion}</td>
        <td><strong>${monedaSimbolo} ${reg.precio.toFixed(2)}</strong></td>
        
        <td>
          <span class="badge badge-${estadoClase}">${estadoTexto}</span>
        </td>
        
        <td>
          <div class="action-buttons">
            <button onclick="verDetalle('${reg.id}')" class="btn-action btn-view" title="Ver detalles">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button onclick="editarRegistro('${reg.id}')" class="btn-action btn-edit" title="Editar registro">
              <i class="fa-solid fa-edit"></i>
            </button>
            <button onclick="eliminarRegistro('${reg.id}', '${reg.nhabitacion}')" class="btn-action btn-delete" title="Eliminar registro">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  $('#tabBody').html(filas);
  renderPag();
};

const renderPag = () => {
  const totPag = Math.ceil(regsFil.length / regsPag);
  if (totPag <= 1) { $('#pagBox').empty(); return; }
  const btns = [];
  if (pagActual > 1) btns.push(`<button onclick="cambiarPagina(${pagActual - 1})" class="page-btn">‹</button>`);
  for (let i = Math.max(1, pagActual - 2); i <= Math.min(totPag, pagActual + 2); i++) btns.push(`<button onclick="cambiarPagina(${i})" class="page-btn ${i === pagActual ? 'active' : ''}">${i}</button>`);
  if (pagActual < totPag) btns.push(`<button onclick="cambiarPagina(${pagActual + 1})" class="page-btn">›</button>`);
  $('#pagBox').html(btns.join(''));
};

window.cambiarPagina = (pag) => { pagActual = pag; renderTab(); };

const actuStats = () => {
  const tot = regsFil.length;
  const ing = regsFil.reduce((s, r) => s + (r.moneda === 'Soles' ? r.precio : r.precio * 3.8), 0);
  const habs = [...new Set(regsFil.map(r => r.nhabitacion))].length;
  const noches = regsFil.reduce((s, r) => s + (r.diasReservados || 1), 0);
  const prom = noches > 0 ? ing / noches : 0;
  $('#totReg').text(tot);
  $('#numHab').text(habs);
  $('#ingTot').text(`S/ ${ing.toFixed(2)}`);
  $('#proNoc').text(`S/ ${prom.toFixed(2)}`);
};

const llenarColab = () => {
  const cols = [...new Set([...regs.map(r => r.registradoPor), ...regs.map(r => r.actualizadoPor)].filter(Boolean))];
  $('#filCola').html('<option value="">Todos</option>' + 
    cols.map(c => `<option value="${c}">${getNombre(c)}</option>`).join('')); // 🔥 Mostrar nombre
};

window.verDetalle = (id) => { verReg(id); $('html, body').animate({ scrollTop: $('.form-panel').offset().top - 100 }, 800); };
window.editarRegistro = (id) => { editReg(id); $('html, body').animate({ scrollTop: $('.form-panel').offset().top - 100 }, 800); };

// 🔥 ELIMINAR REGISTRO + LIBERAR HABITACIÓN
window.eliminarRegistro = async (id, numeroHab) => {
  if (!confirm('¿Eliminar registro?\n\nLa habitación quedará libre.')) return;
  try {
    // 1️⃣ Eliminar registro de hotelventas
    await deleteDoc(doc(db, 'hotelventas', id));
    
    // 2️⃣ Liberar habitación
    await updateDoc(doc(db, 'habitaciones', numeroHab), {
      estado: 'libre',
      cliente: null,
      checkIn: null,
      checkOut: null,
      registroId: null,
      fechaActualizado: serverTimestamp()
    });
    
    // 3️⃣ Actualizar UI
    regs = regs.filter(r => r.id !== id);
    regsFil = regsFil.filter(r => r.id !== id);
    renderTab();
    actuStats();
    await actuHabs(); // 🔥 ACTUALIZAR PANEL DE HABITACIONES
    
    Notificacion(`✅ Eliminado - Hab ${numeroHab} liberada`, 'success');
  } catch (e) { console.error('Error eliminar:', e); Notificacion('❌ Error', 'error'); }
};

// 🔥 ACTUALIZAR SOLO LIMPIANDO CACHES
$(document).on('click', '.bt_cargar', async () => {
  try {
    $('.bt_cargar i').addClass('fa-spin');
    
    // 🗑️ LIMPIAR TODOS LOS CACHES
    removels('habsPanel');
    removels('histRegs');
    removels('usuariosSmile');
    
    // 🔄 RECARGAR DATOS (USA FIREBASE AUTOMÁTICAMENTE)
    await cargarHist();
    await actuHabs();
    
    Notificacion('✅ Actualizado', 'success');
  } catch (e) { 
    console.error('Error:', e); 
    Notificacion('❌ Error', 'error'); 
  } finally { 
    $('.bt_cargar i').removeClass('fa-spin'); 
  }
});