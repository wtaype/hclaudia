import{t as b,$ as v,v as f,x as h,y as r,a as s,b as m,q as g,c as y,e as C,l as H,h as u,M as k}from"./widev-BOjYXDSJ.js";import{h as w,c as S}from"./habEstado-DrRNyQ4K.js";let o=null;b(u,async a=>{if(!a)return window.location.href="/";o=a;try{const i=h("wiSmile");if(i)return p(i),r(s,o);const e=(await m(g(y(s,"smiles"),C("usuario","==",a.displayName)))).docs[0].data();H("wiSmile",e,450),p(e),r(s,o)}catch(i){console.error(i)}});v(document).on("click",".bt_salir",async()=>{await f(u),window.location.href="/";try{localStorage.clear()}catch{Object.keys(localStorage).forEach(i=>localStorage.removeItem(i))}});function p(a){console.log(a.nombre),k("Bienvenido "+a.nombre+"!"),v(".app").html(`
<header class="top-header">
  <div class="header-container">
    <div class="header-left">
      <h1><i class="fa-solid fa-hotel"></i> Hospedaje HClaudia</h1>
      <select class="mes-selector" id="monthFilter">${i()}</select>
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
        <img id="usrImg" src="${a.imagen||"/smile.png"}" alt="Usuario" class="user-avatar">
        <span id="usrNom">${a.nombre}</span>
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
          <div class="form-grid">

            <div class="form-group">
              <label><i class="fa-solid fa-door-open"></i> N° Habitación</label>
              <select id="nhabitacion" required>
                <option >Selecciona</option>
                <option value="101">Habitación 101</option>
                <option value="102">Habitación 102</option>
                <option value="103">Habitación 103</option>
                <option value="201">Habitación 201</option>
                <option value="202">Habitación 202</option>
                <option value="203">Habitación 203</option>
                <option value="204">Habitación 204</option>
                <option value="205">Habitación 205</option>
              </select>
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-dollar-sign"></i> Precio</label>
              <input type="number" id="precio" step="0.01" min="0" placeholder="150.00" required>
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-credit-card"></i> Estado del Pago</label>
              <select id="estadoPago" required>
                <option value="pagado selected">Pagado</option>
                <option value="deuda">Deuda</option>
              </select>
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-user"></i> Nombre del Cliente</label>
              <input type="text" id="nombreCliente" placeholder="Nombre completo" required>
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-id-card"></i> Tipo de Documento</label>
              <select id="tipoDocumento" required>
                <option value="DNI">DNI</option>
                <option value="Carnet Extranjeria">Carnet Extranjeria</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Cedula">Cédula</option>
                <option value="RUC">RUC</option>
              </select>
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-hashtag"></i> N° Documento</label>
              <input type="text" id="numDocumento" placeholder="Ingrese documento" required>
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-calendar-days"></i> Noches Rervados</label>
              <input type="number" id="diasReservados" min="1" value="1" required>
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-calendar-day"></i> CheckIn</label>
              <input type="datetime-local" id="checkIn" required>
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-calendar-check"></i> CheckOut</label>
              <input type="datetime-local" id="checkOut" required>
            </div>


            <div class="form-group">
              <label><i class="fa-solid fa-coins"></i> Moneda</label>
              <select id="moneda" required>
                <option value="Soles">Soles (S/)</option>
                <option value="Dolares">Dólares (US$)</option>
              </select>
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-money-check-dollar"></i> Método</label>
              <select id="metodoPago" required>
                <option value="Tarjeta">Tarjeta de Débito/Crédito</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Yape">Yape</option>
                <option value="Plin">Plin</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-utensils"></i> Incluye Desayuno</label>
              <select id="desayuno">
              <option value="si" selected>Si incluye</option>
                <option value="no">No incluye</option>
              </select>
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-car"></i> Número de Placa</label>
              <input type="text" id="carroPlaca" placeholder="Opcional">
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-phone"></i> Celular (Opcional) </label>
              <input type="tel" id="celular" placeholder="987654321">
            </div>

            <div class="form-group">
              <label><i class="fa-solid fa-hashtag"></i> Cantidad de personas</label>
              <input type="text" id="qPersonas" placeholder="Ejem: 2, 3, 5">
            </div>

            <div class="form-group span-2">
              <label><i class="fa-solid fa-comment"></i> Comentario (Opcional) </label>
              <input type="text" id="comentario" placeholder="Opcional">
            </div>

          </div>

          <button type="submit" class="btn-save">
            <i class="fa-solid fa-check-circle"></i> Guardar
          </button>
        </form>
      </div>
    </div>

    <div class="separator"></div>

    <div class="colabs-panel">
      <div class="panel-header"><h2><i class="fa-solid fa-users"></i> Estado de Habitaciones </h2></div>
      <div class="panel-body">
        <div class="rooms-grid" id="roomsGrid">
          <div class="loading-colabs"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</div>
        </div>
      </div>
    </div>


  </div>

  <div class="info-cards">
    <div class="info-card"><div class="card-icon" style="background:rgba(34,197,94,.1)"><i class="fa-solid fa-clipboard-check" style="color:#22c55e"></i></div><div class="card-content"><span class="card-value" id="totReg">0</span><span class="card-label">Total</span></div></div>
    <div class="info-card"><div class="card-icon" style="background:rgba(59,130,246,.1)"><i class="fa-solid fa-bed" style="color:#3b82f6"></i></div><div class="card-content"><span class="card-value" id="numHab">0</span><span class="card-label">Habitaciones</span></div></div>
    <div class="info-card"><div class="card-icon" style="background:rgba(251,191,36,.1)"><i class="fa-solid fa-coins" style="color:#fbbf24"></i></div><div class="card-content"><span class="card-value" id="ingTot">S/ 0.00</span><span class="card-label">Ingreso</span></div></div>
    <div class="info-card"><div class="card-icon" style="background:rgba(168,85,247,.1)"><i class="fa-solid fa-chart-line" style="color:#a855f7"></i></div><div class="card-content"><span class="card-value" id="proNoc">S/ 0.00</span><span class="card-label">Prom/Noche</span></div></div>
  </div>

  <div class="registros-section">
    <div class="section-header">
      <h2><i class="fa-solid fa-list"></i> Historial</h2>
      <div class="filters-container">
        <div class="filter-group"><label>Colaborador</label><select id="filCola"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>Mostrar</label><select id="filCant"><option value="5">5</option><option value="10" selected>10</option><option value="15">15</option><option value="all">Todos</option></select></div>
      </div>
    </div>

    <div class="table-container">
      <table class="registros-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Cliente</th>
            <th>Doc</th>
            <th>Hab - Tipo</th>
            <th>Precio</th>
            <th>Pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="tabBody">
          <tr><td colspan="10" style="text-align:center;color:var(--bg2);padding:2vh">Sin datos</td></tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" id="pagBox"></div>
  </div>
</div>

<footer class="foo hwb txc">
  <p>Creado con <i class="wicon wi-corazon"></i> by <a class="ftx lkme" href="https://wtaype.github.io/" target="_blank">@wilder.taype</a> 2025 - HClaudia</p>
</footer>

`),w(),S(o);function i(){const l=new Date,e=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];return Array.from({length:7},(D,t)=>{const c=new Date(l.getFullYear(),l.getMonth()+t-3,1),d=c.getMonth(),n=c.getFullYear();return`<option value="${`${n}-${String(d+1).padStart(2,"0")}`}" ${t===3?"selected":""}>${e[d]} ${n}</option>`}).join("")}}
