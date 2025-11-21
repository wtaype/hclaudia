import './smile.css';
import './wiupdate.js';
import './footer.js';
import $ from 'jquery';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { auth, db } from '../firebase/init.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { wiTema, Mensaje, savels, getls } from './widev.js';
import { habs } from './habEstado.js';
import { configReg } from './habRegistrar.js';
import { configHist } from './habHistorial.js';

// 🔐 AUTENTICACIÓN
let wiUsuario = null;
onAuthStateChanged(auth, async user => {
  if (!user) return window.location.href = '/';
  wiUsuario = user;
  try {
    const wi = getls('wiSmile');
    if (wi) return smileContenido(wi), wiTema(db, wiUsuario);
    const busq = await getDocs(query(collection(db, 'smiles'), where('usuario', '==', user.displayName)));
    const widt = busq.docs[0].data();
    savels('wiSmile', widt, 450);
    smileContenido(widt);
    wiTema(db, wiUsuario);
  } catch (e) { console.error(e); }
});

// CERRAR SESIÓN
$(document).on('click', '.bt_salir', async () => {
  await signOut(auth);
  window.location.href = '/';
  try { localStorage.clear(); } catch (_) { Object.keys(localStorage).forEach(k => localStorage.removeItem(k)); }
});

// 🎨 CONTENIDO PRINCIPAL
function smileContenido(wi) {
  Mensaje(`Bienvenido ${wi.nombre}!`);
  $('.app').html(`
    <header class="top-header">
      <div class="header-container">
        <div class="header-left">
          <h1><i class="fa-solid fa-hotel"></i> Hospedaje HClaudia</h1>
          <select class="mes-selector" id="monthFilter">${genMeses()}</select>
        </div>
        <div class="header-right">
          <button class="btn-refresh bt_cargar" title="Actualizar"><i class="fa-solid fa-rotate-right"></i></button>
          <div class="witemas">
            <div class="tema mtha" data-theme="Dulce"></div>
            <div class="tema" data-theme="Cielo"></div>
            <div class="tema" data-theme="Paz"></div>
            <div class="tema" data-theme="Mora"></div>
          </div>
          <div class="user-info">
            <img id="usrImg" src="${wi.imagen || '/smile.png'}" alt="Usuario" class="user-avatar">
            <span id="usrNom">${wi.nombre}</span>
          </div>
          <button class="btn-logout bt_salir"><i class="fa-solid fa-sign-out-alt"></i> Salir</button>
        </div>
      </div>
    </header>

    <div class="miwp">
      <div class="main-layout">
        <div class="form-panel">
          <div class="panel-header"><h2><i class="fa-solid fa-clipboard-check"></i> Registro de Habitación HClaudia</h2></div>
          <div class="panel-body">
            <form id="regForm">
              <div class="form-grid">${genCampos()}</div>
              <button type="submit" class="btn-save"><i class="fa-solid fa-check-circle"></i> Guardar</button>
            </form>
          </div>
        </div>

        <div class="separator"></div>

        <div class="colabs-panel">
          <div class="panel-header"><h2><i class="fa-solid fa-users"></i> Estado de Habitaciones</h2></div>
          <div class="panel-body">
            <div class="rooms-grid" id="roomsGrid">
              <div class="loading-colabs"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-cards">${genCards()}</div>

      <div class="registros-section">
        <div class="section-header">
          <h2><i class="fa-solid fa-list"></i> Historial</h2>
          <div class="filters-container">
            <div class="filter-group foo_fresh"><label>Actualizar</label><i class="fa-solid fa-rotate-right"></i></div>
            <div class="filter-group"><label>Colaborador</label><select id="filCola"><option value="">Todos</option></select></div>
            <div class="filter-group"><label>Mostrar</label><select id="filCant"><option value="5">5</option><option value="10" selected>10</option><option value="15">15</option><option value="all">Todos</option></select></div>
          </div>
        </div>
        <div class="table-container">
          <table class="registros-table">
            <thead><tr><th>Fecha</th><th>Usuario</th><th>Check-in</th><th>Check-out</th><th>Cliente</th><th>Documento</th><th>Hab - Tipo</th><th>Precio</th><th>Pago</th><th>Acciones</th></tr></thead>
            <tbody id="tabBody"><tr><td colspan="10" style="text-align:center;color:var(--bg2);padding:2vh">Sin datos</td></tr></tbody>
          </table>
        </div>
        <div class="pagination" id="pagBox"></div>
      </div>
    </div>

    ${footer()}
  `);

  habs();
  configReg(wiUsuario);
  configHist();
}

// 📅 MESES COMPLETOS
const genMeses = () => {
  const hoy = new Date();
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return Array.from({ length: 7 }, (_, i) => {
    const f = new Date(hoy.getFullYear(), hoy.getMonth() + i - 3, 1);
    const v = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
    return `<option value="${v}" ${i === 3 ? 'selected' : ''}>${meses[f.getMonth()]} ${f.getFullYear()}</option>`;
  }).join('');
};

// 🏗️ CAMPOS DEL FORMULARIO
const genCampos = () => {
  const cps = [
    { id: 'nhabitacion', label: 'N° Habitación', tipo: 'select', icon: 'fa-door-open', opts: '<option>Selecciona</option>' },
    { id: 'precio', label: 'Precio', tipo: 'number', icon: 'fa-dollar-sign', ph: '150.00' },
    { id: 'estadoPago', label: 'Estado del Pago', tipo: 'select', icon: 'fa-credit-card', opts: '<option value="pagado" selected>Pagado</option><option value="deuda">Deuda</option>' },
    { id: 'nombreCliente', label: 'Nombre del Cliente', tipo: 'text', icon: 'fa-user', ph: 'Nombre completo' },
    { id: 'tipoDocumento', label: 'Tipo de Documento', tipo: 'select', icon: 'fa-id-card', opts: '<option value="DNI">DNI</option><option value="Carnet Extranjeria">Carnet Extranjeria</option><option value="Pasaporte">Pasaporte</option><option value="Cedula">Cédula</option><option value="RUC">RUC</option>' },
    { id: 'numDocumento', label: 'N° Documento', tipo: 'text', icon: 'fa-hashtag', ph: 'Ingrese documento' },
    { id: 'diasReservados', label: 'Noches Reservados', tipo: 'number', icon: 'fa-calendar-days', val: '1' },
    { id: 'checkIn', label: 'CheckIn', tipo: 'datetime-local', icon: 'fa-calendar-day' },
    { id: 'checkOut', label: 'CheckOut', tipo: 'datetime-local', icon: 'fa-calendar-check' },
    { id: 'moneda', label: 'Moneda', tipo: 'select', icon: 'fa-coins', opts: '<option value="Soles">Soles (S/)</option><option value="Dolares">Dólares (US$)</option>' },
    { id: 'metodoPago', label: 'Método', tipo: 'select', icon: 'fa-money-check-dollar', opts: '<option value="Tarjeta">Tarjeta de Débito/Crédito</option><option value="Transferencia">Transferencia Bancaria</option><option value="Yape">Yape</option><option value="Plin">Plin</option><option value="Efectivo">Efectivo</option>' },
    { id: 'desayuno', label: 'Incluye Desayuno', tipo: 'select', icon: 'fa-utensils', opts: '<option value="si" selected>Si incluye</option><option value="no">No incluye</option>' },
    { id: 'carroPlaca', label: 'Número de Placa', tipo: 'text', icon: 'fa-car', ph: 'Opcional' },
    { id: 'celular', label: 'Celular (Opcional)', tipo: 'tel', icon: 'fa-phone', ph: '987654321' },
    { id: 'qPersonas', label: 'Cantidad de personas', tipo: 'text', icon: 'fa-hashtag', ph: 'Ejem: 2, 3, 5' },
    { id: 'comentario', label: 'Comentario (Opcional)', tipo: 'text', icon: 'fa-comment', ph: 'Opcional', span: 'span-2' }
  ];

  return cps.map(c => `
    <div class="form-group ${c.span || ''}">
      <label><i class="fa-solid ${c.icon}"></i> ${c.label}</label>
      ${c.tipo === 'select'
        ? `<select id="${c.id}" ${c.id === 'nhabitacion' || c.id === 'estadoPago' || c.id === 'tipoDocumento' || c.id === 'diasReservados' || c.id === 'checkIn' || c.id === 'checkOut' || c.id === 'moneda' || c.id === 'metodoPago' ? 'required' : ''}>${c.opts}</select>`
        : `<input type="${c.tipo}" id="${c.id}" placeholder="${c.ph || ''}" ${c.val ? `value="${c.val}"` : ''} ${c.id === 'precio' || c.id === 'nombreCliente' || c.id === 'numDocumento' || c.id === 'diasReservados' || c.id === 'checkIn' || c.id === 'checkOut' ? 'required' : ''}>`
      }
    </div>
  `).join('');
};

// 📊 TARJETAS INFORMATIVAS
const genCards = () => {
  const cds = [
    { id: 'totReg', label: 'Total', icon: 'fa-clipboard-check', color: '#22c55e', val: '0' },
    { id: 'numHab', label: 'Habitaciones', icon: 'fa-bed', color: '#3b82f6', val: '0' },
    { id: 'ingTot', label: 'Ingreso', icon: 'fa-coins', color: '#fbbf24', val: 'S/ 0.00' },
    { id: 'proNoc', label: 'Prom/Noche', icon: 'fa-chart-line', color: '#a855f7', val: 'S/ 0.00' }
  ];

  return cds.map(c => `
    <div class="info-card">
      <div class="card-icon" style="background:rgba(${parseInt(c.color.slice(1, 3), 16)},${parseInt(c.color.slice(3, 5), 16)},${parseInt(c.color.slice(5, 7), 16)},.1)">
        <i class="fa-solid ${c.icon}" style="color:${c.color}"></i>
      </div>
      <div class="card-content">
        <span class="card-value" id="${c.id}">${c.val}</span>
        <span class="card-label">${c.label}</span>
      </div>
    </div>
  `).join('');
};