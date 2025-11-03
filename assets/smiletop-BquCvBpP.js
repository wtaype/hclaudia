import{$ as i,N as o,j as H,z,d as v,a as u,A as h,B as D,i as E,v as w,b as k,c as y,l as $,t as I,x as m,q as O,e as S,h as N,y as A,M}from"./widev-DWYmvaYH.js";import{b as x}from"./habEstado-DlVIy7vK.js";let r=[],d=null;async function p(a){d=a;try{const t=w("habitacionesControl");if(t&&t.length>0){r=t,f();return}r=(await k(y(u,"habitaciones"))).docs.map(e=>({id:e.id,...e.data()})),$("habitacionesControl",r,300),f()}catch(t){console.error("Error carga:",t),o("Error al cargar habitaciones","error")}}function f(){const a=`
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
                ${r.length>0?r.map(t=>C(t)).join(""):`
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
    `;i("#contenedorHabitaciones").html(a)}function C(a,t=!1){const n={libre:"#10b981",ocupado:"#ef4444",limpieza:"#06b6d4",fuera:"#f59e0b"},e=c=>{if(!c)return"-";const s=c.toDate?c.toDate():new Date(c);return s.toLocaleDateString("es-PE")+" "+s.toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"})};if(t){const c=s=>{if(!s)return"";try{return(s.toDate?s.toDate():new Date(s)).toISOString().slice(0,16)}catch{return""}};return`
            <tr class="editing-row" data-id="${a.id}">
                <td><strong>${a.numero}</strong></td>
                <td>
                    <select id="tipoHabitacion" class="edit-input">
                        <option value="Individual" ${a.tipo==="Individual"?"selected":""}>Individual</option>
                        <option value="Doble" ${a.tipo==="Doble"?"selected":""}>Doble</option>
                        <option value="Triple" ${a.tipo==="Triple"?"selected":""}>Triple</option>
                        <option value="Matrimonial" ${a.tipo==="Matrimonial"?"selected":""}>Matrimonial</option>
                        <option value="Matrimonial superior" ${a.tipo==="Matrimonial superior"?"selected":""}>Matrimonial superior</option>
                    </select>
                </td>
                <td>
                    <input id="clienteHabitacion" type="text" class="edit-input" 
                           placeholder="Cliente" value="${a.cliente||""}" >
                </td>
                <td>
                    <input id="checkInHabitacion" type="datetime-local" class="edit-input" 
                           value="${c(a.checkIn)}" >
                </td>
                <td>
                    <input id="checkOutHabitacion" type="datetime-local" class="edit-input" 
                           value="${c(a.checkOut)}" >
                </td>
                <td>
                    <select id="estadoHabitacion" class="edit-input">
                        <option value="libre" ${a.estado==="libre"?"selected":""}>Libre</option>
                        <option value="ocupado" ${a.estado==="ocupado"?"selected":""}>Ocupado</option>
                        <option value="limpieza" ${a.estado==="limpieza"?"selected":""}>Limpieza</option>
                        <option value="fuera" ${a.estado==="fuera"?"selected":""}>Fuera</option>
                    </select>
                </td>
                <td class="actions-cell">
                    <button onclick="guardarCambiosHabitacion('${a.id}')" class="btn-action btn-save">
                        <i class="fas fa-check"></i>
                    </button>
                    <button onclick="cancelarEdicionHabitacion()" class="btn-action btn-cancel">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `}return`
        <tr data-id="${a.id}">
            <td><strong>${a.numero}</strong></td>
            <td>${a.tipo||"Individual"}</td>
            <td>${a.cliente||"-"}</td>
            <td class="date-cell">${e(a.checkIn)}</td>
            <td class="date-cell">${e(a.checkOut)}</td>
            <td>
                <span class="badge" style="background:${n[a.estado]||"#666"};color:white;padding:4px 8px;border-radius:12px;">
                    ${(a.estado||"libre").toUpperCase()}
                </span>
            </td>
            <td class="actions-cell">
                <button onclick="editarHabitacionControl('${a.id}')" class="btn-action btn-edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="eliminarHabitacionControl('${a.id}')" class="btn-action btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `}window.editarHabitacionControl=function(a){const t=r.find(n=>n.id===a);t&&(i(`tr[data-id="${a}"]`).replaceWith(C(t,!0)),i("#tipoHabitacion").focus(),o("Editando habitación...","info"))};window.cancelarEdicionHabitacion=function(){f(),o("Edición cancelada","info")};window.guardarCambiosHabitacion=async function(a){const t=i("#tipoHabitacion").val(),n=i("#clienteHabitacion").val().trim(),e=i("#checkInHabitacion").val(),c=i("#checkOutHabitacion").val(),s=i("#estadoHabitacion").val();if(!t)return o("Tipo obligatorio","error");try{const l={tipo:t,cliente:n||null,estado:s,checkIn:e?new Date(e):null,checkOut:c?new Date(c):null,actualizadoPor:d,fechaActualizado:H()};await z(v(u,"habitaciones",a),l),h("habitacionesControl"),await p(d),await x(),o("Habitación actualizada","success")}catch(l){console.error("Error guardar:",l),o("Error al guardar","error")}};window.eliminarHabitacionControl=async function(a){const t=r.find(n=>n.id===a);if(t&&confirm(`¿Eliminar habitación ${t.numero}?

Esta acción no se puede deshacer.`))try{await D(v(u,"habitaciones",a)),h("habitacionesControl"),await p(d),o("Habitación eliminada","success")}catch(n){console.error("Error eliminar:",n),o("Error al eliminar","error")}};window.agregarNuevaHabitacion=function(){const a=prompt("Número de habitación (ej: 101, 102, 201):");if(!a||!a.trim())return;const t=a.trim();if(r.some(e=>e.numero===t||e.id===t))return o("Habitación ya existe","error");const n=`
        <tr class="editing-row new-habitacion-row">
            <td><strong>${t}</strong></td>
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
                <button onclick="guardarNuevaHabitacionControl('${t}')" class="btn-action btn-save">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="cancelarNuevaHabitacion()" class="btn-action btn-cancel">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `;r.length>0?i("tbody").append(n):i("tbody").html(n),i("#tipoHabitacion").focus(),o("Agregando nueva habitación...","info")};window.guardarNuevaHabitacionControl=async function(a){const t=i("#tipoHabitacion").val(),n=i("#clienteHabitacion").val().trim(),e=i("#checkInHabitacion").val(),c=i("#checkOutHabitacion").val(),s=i("#estadoHabitacion").val();if(!t)return o("Tipo obligatorio","error");try{const l={numero:a,tipo:t,cliente:n||null,estado:s||"libre",checkIn:e?new Date(e):null,checkOut:c?new Date(c):null,registradoPor:d,actualizadoPor:d,fechaActualizado:H()};await E(v(u,"habitaciones",a),l),h("habitacionesControl"),await p(d),await actualizarHabitaciones(),o(`Habitación ${a} creada`,"success")}catch(l){console.error("Error crear:",l),o("Error al crear habitación","error")}};window.cancelarNuevaHabitacion=function(){r.length>0?i(".new-habitacion-row").remove():f(),o("Nueva habitación cancelada","info")};window.actualizarHabitacionesFromDB=async function(){h("habitacionesControl"),await p(d),o("Habitaciones actualizadas","success")};let b=null;I(N,async a=>{if(!a)return window.location.href="/";b=a;try{const t=w("wiSmile");if(t)return g(t),m(u,b);const e=(await k(O(y(u,"smiles"),S("usuario","==",a.displayName)))).docs[0].data();$("wiSmile",e,450),g(e),m(u,b)}catch(t){console.error(t)}});i(document).on("click",".bt_salir",async()=>{await A(N),window.location.href="/";try{localStorage.clear()}catch{Object.keys(localStorage).forEach(t=>localStorage.removeItem(t))}});function g(a){M("Bienvenido "+a.nombre+"!"),i(".app").html(`
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
                    <img src="${a.imagen||"./smile.png"}" alt="Avatar" class="user-avatar">
                    <span>${a.nombre||"Admin"}</span>
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
    `),T()}async function T(){try{await p(b.email),o("Sistema iniciado","success")}catch(a){console.error("Error:",a),o("Error al inicializar","error")}}
