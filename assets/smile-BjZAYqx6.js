import{t as p,v,x as s,a as l,b as u,q as h,c as b,e as m,l as f,h as d,$ as c,y as g,M as $}from"./widev-DWYmvaYH.js";import{h as y,c as C,a as k}from"./habEstado-DlVIy7vK.js";let t=null;p(d,async o=>{if(!o)return window.location.href="/";t=o;try{const a=v("wiSmile");if(a)return n(a),s(l,t);const e=(await u(h(b(l,"smiles"),m("usuario","==",o.displayName)))).docs[0].data();f("wiSmile",e,450),n(e),s(l,t)}catch(a){console.error(a)}});c(document).on("click",".bt_salir",async()=>{await g(d),window.location.href="/";try{localStorage.clear()}catch{Object.keys(localStorage).forEach(a=>localStorage.removeItem(a))}});function n(o){$(`Bienvenido ${o.nombre}!`),c(".app").html(`
    <header class="top-header">
      <div class="header-container">
        <div class="header-left">
          <h1><i class="fa-solid fa-hotel"></i> Hospedaje HClaudia</h1>
          <select class="mes-selector" id="monthFilter">${w()}</select>
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
            <img id="usrImg" src="${o.imagen||"/smile.png"}" alt="Usuario" class="user-avatar">
            <span id="usrNom">${o.nombre}</span>
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
              <div class="form-grid">${D()}</div>
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

      <div class="info-cards">${S()}</div>

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

    <footer class="foo hwb txc">
      <p>Creado con <i class="wicon wi-corazon"></i> by <a class="ftx lkme" href="https://wtaype.github.io/" target="_blank">@wilder.taype</a> 2025 - HClaudia</p>
    </footer>
  `),y(),C(t),k()}const w=()=>{const o=new Date,a=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];return Array.from({length:7},(r,e)=>{const i=new Date(o.getFullYear(),o.getMonth()+e-3,1);return`<option value="${`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}`}" ${e===3?"selected":""}>${a[i.getMonth()]} ${i.getFullYear()}</option>`}).join("")},D=()=>[{id:"nhabitacion",label:"N° Habitación",tipo:"select",icon:"fa-door-open",opts:"<option>Selecciona</option>"},{id:"precio",label:"Precio",tipo:"number",icon:"fa-dollar-sign",ph:"150.00"},{id:"estadoPago",label:"Estado del Pago",tipo:"select",icon:"fa-credit-card",opts:'<option value="pagado" selected>Pagado</option><option value="deuda">Deuda</option>'},{id:"nombreCliente",label:"Nombre del Cliente",tipo:"text",icon:"fa-user",ph:"Nombre completo"},{id:"tipoDocumento",label:"Tipo de Documento",tipo:"select",icon:"fa-id-card",opts:'<option value="DNI">DNI</option><option value="Carnet Extranjeria">Carnet Extranjeria</option><option value="Pasaporte">Pasaporte</option><option value="Cedula">Cédula</option><option value="RUC">RUC</option>'},{id:"numDocumento",label:"N° Documento",tipo:"text",icon:"fa-hashtag",ph:"Ingrese documento"},{id:"diasReservados",label:"Noches Reservados",tipo:"number",icon:"fa-calendar-days",val:"1"},{id:"checkIn",label:"CheckIn",tipo:"datetime-local",icon:"fa-calendar-day"},{id:"checkOut",label:"CheckOut",tipo:"datetime-local",icon:"fa-calendar-check"},{id:"moneda",label:"Moneda",tipo:"select",icon:"fa-coins",opts:'<option value="Soles">Soles (S/)</option><option value="Dolares">Dólares (US$)</option>'},{id:"metodoPago",label:"Método",tipo:"select",icon:"fa-money-check-dollar",opts:'<option value="Tarjeta">Tarjeta de Débito/Crédito</option><option value="Transferencia">Transferencia Bancaria</option><option value="Yape">Yape</option><option value="Plin">Plin</option><option value="Efectivo">Efectivo</option>'},{id:"desayuno",label:"Incluye Desayuno",tipo:"select",icon:"fa-utensils",opts:'<option value="si" selected>Si incluye</option><option value="no">No incluye</option>'},{id:"carroPlaca",label:"Número de Placa",tipo:"text",icon:"fa-car",ph:"Opcional"},{id:"celular",label:"Celular (Opcional)",tipo:"tel",icon:"fa-phone",ph:"987654321"},{id:"qPersonas",label:"Cantidad de personas",tipo:"text",icon:"fa-hashtag",ph:"Ejem: 2, 3, 5"},{id:"comentario",label:"Comentario (Opcional)",tipo:"text",icon:"fa-comment",ph:"Opcional",span:"span-2"}].map(a=>`
    <div class="form-group ${a.span||""}">
      <label><i class="fa-solid ${a.icon}"></i> ${a.label}</label>
      ${a.tipo==="select"?`<select id="${a.id}" ${a.id==="nhabitacion"||a.id==="estadoPago"||a.id==="tipoDocumento"||a.id==="diasReservados"||a.id==="checkIn"||a.id==="checkOut"||a.id==="moneda"||a.id==="metodoPago"?"required":""}>${a.opts}</select>`:`<input type="${a.tipo}" id="${a.id}" placeholder="${a.ph||""}" ${a.val?`value="${a.val}"`:""} ${a.id==="precio"||a.id==="nombreCliente"||a.id==="numDocumento"||a.id==="diasReservados"||a.id==="checkIn"||a.id==="checkOut"?"required":""}>`}
    </div>
  `).join(""),S=()=>[{id:"totReg",label:"Total",icon:"fa-clipboard-check",color:"#22c55e",val:"0"},{id:"numHab",label:"Habitaciones",icon:"fa-bed",color:"#3b82f6",val:"0"},{id:"ingTot",label:"Ingreso",icon:"fa-coins",color:"#fbbf24",val:"S/ 0.00"},{id:"proNoc",label:"Prom/Noche",icon:"fa-chart-line",color:"#a855f7",val:"S/ 0.00"}].map(a=>`
    <div class="info-card">
      <div class="card-icon" style="background:rgba(${parseInt(a.color.slice(1,3),16)},${parseInt(a.color.slice(3,5),16)},${parseInt(a.color.slice(5,7),16)},.1)">
        <i class="fa-solid ${a.icon}" style="color:${a.color}"></i>
      </div>
      <div class="card-content">
        <span class="card-value" id="${a.id}">${a.val}</span>
        <span class="card-label">${a.label}</span>
      </div>
    </div>
  `).join("");
