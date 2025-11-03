import $ from 'jquery';
import { db, auth } from '../firebase/init.js';
import { collection, doc, updateDoc, serverTimestamp, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Notificacion, getls, savels } from './widev.js';
import { actuHabs } from './habEstado.js';
import { actuHist } from './habHistorial.js';

let usr = null, edit = false, idReg = null;

const CAMPOS = {
  nhabitacion:'nhabitacion', precio:'precio', estadoPago:'estadoPago', nombreCliente:'nombreCliente',
  tipoDocumento:'tipoDocumento', numDocumento:'numDocumento', diasReservados:'diasReservados',
  checkIn:'checkIn', checkOut:'checkOut', moneda:'moneda', metodoPago:'metodoPago',
  desayuno:'desayuno', carroPlaca:'carroPlaca', celular:'celular', qPersonas:'qPersonas', comentario:'comentario'
};

// 🔥 DETECTAR AUTH AUTOMÁTICAMENTE
onAuthStateChanged(auth, u => { if (u) usr = u; });

export function configReg(user) { usr = user; initForm(); confFechas(); cargarHabs(); }

const initForm = () => {
  $('#regForm').off('submit').on('submit', async e => { e.preventDefault(); await guardar(); });
  $('#diasReservados, #checkIn').on('input change', calcFechas);
  
  // 🔥 REQUIRED: verde si hay valor, rojo si vacío
  $('#nombreCliente, #checkIn, #checkOut').on('change input', function() {
    $(this).css('border-color', $(this).val() ? 'var(--success)' : 'var(--error)');
  });
  
  // 🔥 VALIDACIONES ESPECÍFICAS
  $('#precio').on('change input', validPrecio);
  $('#tipoDocumento, #numDocumento').on('change input', validDoc);
  
  // 🔥 OPCIONALES: siempre verde si hay valor
  $('#estadoPago, #moneda, #metodoPago, #desayuno, #carroPlaca, #celular, #qPersonas, #comentario, #diasReservados, #nhabitacion').on('change input', function() {
    if ($(this).val()) $(this).css('border-color', 'var(--success)');
  });
  
  // 🔥 COLOREAR SELECTS CON VALOR INICIAL
  $('#tipoDocumento, #estadoPago, #moneda, #desayuno, #metodoPago').each(function() {
    if ($(this).val()) $(this).css('border-color', 'var(--success)');
  });
};


const confFechas = () => {
  const ahora = new Date(), opts = { timeZone: 'America/Lima' };
  const año = ahora.toLocaleString('en-US', { ...opts, year: 'numeric' });
  const mes = ahora.toLocaleString('en-US', { ...opts, month: '2-digit' });
  const dia = ahora.toLocaleString('en-US', { ...opts, day: '2-digit' });
  const hora = ahora.toLocaleString('en-US', { ...opts, hour: '2-digit', hour12: false });
  const min = ahora.toLocaleString('en-US', { ...opts, minute: '2-digit' });
  
  if (!$('#checkIn').val()) $('#checkIn').val(`${año}-${mes}-${dia}T${hora}:${min}`);
  
  if (!$('#checkOut').val()) {
    const mañana = new Date(ahora.getTime() + 86400000);
    const añoM = mañana.toLocaleString('en-US', { ...opts, year: 'numeric' });
    const mesM = mañana.toLocaleString('en-US', { ...opts, month: '2-digit' });
    const diaM = mañana.toLocaleString('en-US', { ...opts, day: '2-digit' });
    $('#checkOut').val(`${añoM}-${mesM}-${diaM}T${hora}:${min}`);
  }
};

async function cargarHabs() {
  try {
    let habs = getls('habsPanel');
    if (!habs) {
      const cons = await getDocs(collection(db, 'habitaciones'));
      habs = cons.docs.map(d => ({ id: d.id, ...d.data() }));
      savels('habsPanel', habs, 300);
    }
    llenarSelect(habs);
  } catch (e) { console.error('Error cargar habs:', e); }
}

const llenarSelect = (habs) => {
  const sel = $('#nhabitacion');
  if (!sel.length) return;
  sel.html('<option value="">Selecciona...</option>' + 
    habs.map(h => `<option value="${h.numero}">Hab ${h.numero} - ${h.tipo || 'Std'} ${h.estado !== 'libre' ? `(${h.estado})` : ''}</option>`).join(''));
};

const calcFechas = () => {
  const entrada = $('#checkIn').val(), noches = parseInt($('#diasReservados').val()) || 1;
  if (entrada) {
    const fEnt = new Date(entrada), fSal = new Date(fEnt);
    fSal.setDate(fSal.getDate() + noches);
    $('#checkOut').val(fSal.toISOString().slice(0, 16));
  }
};

const validDoc = () => {
  const tipo = $('#tipoDocumento').val(), num = $('#numDocumento').val();
  $('#tipoDocumento').css('border-color', tipo ? 'var(--success)' : '');
  if (!num) return $('#numDocumento').css('border-color', '');
  const ok = num.length >= 5;
  $('#numDocumento').css('border-color', ok ? 'var(--success)' : 'var(--error)');
};


const validPrecio = () => {
  const val = $('#precio').val();
  if (!val) return $('#precio').css('border-color', '');
  const ok = parseFloat(val) > 0 && parseFloat(val) <= 2000;
  $('#precio').css('border-color', ok ? 'var(--success)' : 'var(--error)');
};

async function guardar() {
  try {
    const btn = $('.btn-save');
    btn.html('<i class="fa-solid fa-spinner fa-spin"></i> Guardando...').prop('disabled', true);

    const datos = obtDatos();
    if (!validar(datos)) return btn.html('<i class="fa-solid fa-check-circle"></i> Guardar').prop('disabled', false);

    // 🔥 DATOS DEL USUARIO
    const usuario = usr.displayName; 
    const email = usr.email;          

    if (edit) {
      await updateDoc(doc(db, 'hotelventas', idReg), { 
        ...datos, 
        actualizadoPor: usuario, // 🔥 displayName
        fechaActualizado: serverTimestamp() 
      });
      Notificacion('✅ Actualizado', 'success');
    } else {
      const ventaId = `venta_${Date.now()}`;
      
      await setDoc(doc(db, 'hotelventas', ventaId), {
        ...datos,
        fechaRegistro: serverTimestamp(),
        vendedor: usuario,        // 🔥 displayName (igual que retodelmes)
        email: email,             // 🔥 email completo
        registradoPor: usuario,   // 🔥 displayName
        actualizadoPor: usuario,  // 🔥 displayName
        estado: 'activo'
      });

      await updateDoc(doc(db, 'habitaciones', datos.nhabitacion), {
        estado: 'ocupado',
        cliente: datos.nombreCliente,
        checkIn: new Date(datos.checkIn),
        checkOut: new Date(datos.checkOut),
        registroId: ventaId,
        actualizadoPor: usuario, // 🔥 displayName
        fechaActualizado: serverTimestamp()
      });

      Notificacion(`✅ Check-in Hab ${datos.nhabitacion}`, 'success');
    }

    limpiar();
    await actuHabs();
    await actuHist();

  } catch (e) {
    console.error('Error:', e);
    Notificacion('❌ Error al guardar', 'error');
  } finally {
    $('.btn-save').html('<i class="fa-solid fa-check-circle"></i> Guardar').prop('disabled', false);
  }
}

const obtDatos = () => {
  const datos = {};
  Object.keys(CAMPOS).forEach(c => {
    const v = $(`#${c}`).val();
    datos[c] = (c === 'precio' ? parseFloat(v) : c === 'diasReservados' ? parseInt(v) : 
                ['carroPlaca','celular','comentario'].includes(c) && !v ? null : 
                typeof v === 'string' ? v.trim() : v);
  });
  return datos;
};

const validar = (d) => {
  const vals = [
    { campo: d.nhabitacion, mensaje: 'Selecciona habitación', focus: '#nhabitacion' },
    { campo: d.precio > 0, mensaje: 'Precio inválido', focus: '#precio' },
    { campo: d.nombreCliente, mensaje: 'Ingresa cliente', focus: '#nombreCliente' },
    { campo: d.numDocumento, mensaje: 'Ingresa documento', focus: '#numDocumento' },
    { campo: d.checkIn, mensaje: 'Selecciona entrada', focus: '#checkIn' },
    { campo: d.checkOut, mensaje: 'Selecciona salida', focus: '#checkOut' },
    { campo: new Date(d.checkOut) > new Date(d.checkIn), mensaje: 'Salida debe ser después', focus: '#checkOut' }
  ];

  for (const v of vals) {
    if (!v.campo) {
      Notificacion(v.mensaje, 'error');
      $(v.focus).focus();
      return false;
    }
  }
  return true;
};

const limpiar = () => {
  $('#regForm')[0].reset();
  $('#estadoPago').val('pagado'); $('#diasReservados').val('1');
  $('#moneda').val('Soles'); $('#desayuno').val('si');
  $('#regForm input, #regForm select').prop('disabled', false).css({'pointer-events':'auto','opacity':'1'});
  confFechas(); edit = false; idReg = null;
  $('.btn-save').html('<i class="fa-solid fa-check-circle"></i> Guardar').show();
};

export const iniciarCheckIn = (num) => {
  limpiar();
  $('#nhabitacion').val(num);
  confFechas();
  $('#precio').focus();
  Notificacion(`Check-in Hab ${num}`, 'info');
};

export const verReg = async (id) => {
  try {
    await cargarHabs();
    const docSnap = await getDoc(doc(db, 'hotelventas', id)); // ✅ VARIABLE RENOMBRADA
    if (!docSnap.exists()) return Notificacion('No encontrado', 'error');
    llenarForm(docSnap.data());
    $('#regForm input, #regForm select').prop('disabled', true);
    $('.btn-save').hide();
    Notificacion('Modo lectura', 'info');
  } catch (e) { console.error(e); Notificacion('Error', 'error'); }
};

export const editReg = async (id) => {
  try {
    await cargarHabs();
    const docSnap = await getDoc(doc(db, 'hotelventas', id)); // ✅ VARIABLE RENOMBRADA
    if (!docSnap.exists()) return Notificacion('No encontrado', 'error');
    llenarForm(docSnap.data());
    edit = true; idReg = id;
    $('#regForm input, #regForm select').prop('disabled', false).css({'pointer-events':'auto','opacity':'1'});
    $('.btn-save').html('<i class="fa-solid fa-edit"></i> Actualizar').show();
    Notificacion('Modo edición', 'info');
  } catch (e) { console.error(e); Notificacion('Error', 'error'); }
};

const llenarForm = (d) => {
  Object.keys(CAMPOS).forEach(c => {
    const el = $(`#${c}`);
    if (el.length && d[c] !== undefined) {
      if (c === 'checkIn' || c === 'checkOut') {
        const f = d[c].toDate ? d[c].toDate() : new Date(d[c]);
        el.val(f.toISOString().slice(0, 16));
      } else {
        el.val(d[c]);
      }
    }
  });
};