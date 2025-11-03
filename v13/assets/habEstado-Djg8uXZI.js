import{$ as e,N as t,C as y,c as D,a as l,j as u,z as f,d as h,l as m,A as O,x as $,b as C}from"./widev-BKqpaDEY.js";let d=null;function j(o){d=o,P(),I()}function P(){e("#regForm").off("submit").on("submit",async function(o){o.preventDefault(),await F()}),e("#diasReservados").on("input",k),e("#checkIn").on("change",k),e("#numDocumento").on("input",z),e("#precio").on("input",S),e("#checkIn, #checkOut").on("change",E)}function I(){const o=new Date,n=new Date(o.getFullYear(),o.getMonth(),o.getDate(),14,0),c=new Date(o.getFullYear(),o.getMonth(),o.getDate()+1,12,0);e("#checkIn").val()||e("#checkIn").val(n.toISOString().slice(0,16)),e("#checkOut").val()||e("#checkOut").val(c.toISOString().slice(0,16))}function k(){const o=e("#checkIn").val(),n=parseInt(e("#diasReservados").val())||1;if(o){const c=new Date(o),a=new Date(c);a.setDate(a.getDate()+n),a.setHours(12,0),e("#checkOut").val(a.toISOString().slice(0,16))}}function z(){const o=e("#tipoDocumento").val(),n=e("#numDocumento").val();o==="DNI"&&n.length===8?e("#numDocumento").css("border-color","#10b981"):o==="Pasaporte"&&n.length>=6?e("#numDocumento").css("border-color","#10b981"):e("#numDocumento").css("border-color","#ef4444")}function S(){const o=parseFloat(e("#precio").val());o>0&&o<=1e3?e("#precio").css("border-color","#10b981"):e("#precio").css("border-color","#ef4444")}function E(){const o=new Date(e("#checkIn").val());new Date(e("#checkOut").val())>o?e("#checkIn, #checkOut").css("border-color","#10b981"):e("#checkOut").css("border-color","#ef4444")}async function F(){try{e(".btn-save").html('<i class="fa-solid fa-spinner fa-spin"></i> Guardando...'),e(".btn-save").prop("disabled",!0);const o=x();if(!R(o))return;const n=await y(D(l,"registros"),{...o,fechaRegistro:u(),registradoPor:d.email,estado:"activo"});await f(h(l,"habitaciones",o.numeroHabitacion),{estado:"ocupado",cliente:o.nombreCliente,checkIn:new Date(o.checkIn),checkOut:new Date(o.checkOut),actualizadoPor:d.email,fechaActualizado:u()}),H(),await M(),t(`✅ Check-in completado - Habitación ${o.numeroHabitacion}`,"success")}catch(o){console.error("Error registro:",o),t("Error al guardar registro","error")}finally{e(".btn-save").html('<i class="fa-solid fa-check-circle"></i> Guardar'),e(".btn-save").prop("disabled",!1)}}function x(){return{numeroHabitacion:e("#nhabitacion").val(),precio:parseFloat(e("#precio").val()),estadoPago:e("#estadoPago").val(),nombreCliente:e("#nombreCliente").val().trim(),tipoDocumento:e("#tipoDocumento").val(),numDocumento:e("#numDocumento").val().trim(),diasReservados:parseInt(e("#diasReservados").val()),checkIn:e("#checkIn").val(),checkOut:e("#checkOut").val(),moneda:e("#moneda").val(),metodoPago:e("#metodoPago").val(),desayuno:e("#desayuno").val(),carroPlaca:e("#carroPlaca").val().trim()||null,celular:e("#celular").val().trim()||null,qPersonas:e("#qPersonas").val().trim(),comentario:e("#comentario").val().trim()||null}}function R(o){return o.numeroHabitacion?!o.precio||o.precio<=0?(t("Ingresa un precio válido","error"),e("#precio").focus(),!1):o.nombreCliente?o.numDocumento?o.checkIn?o.checkOut?new Date(o.checkOut)<=new Date(o.checkIn)?(t("El check-out debe ser posterior al check-in","error"),e("#checkOut").focus(),!1):!0:(t("Selecciona fecha y hora de check-out","error"),e("#checkOut").focus(),!1):(t("Selecciona fecha y hora de check-in","error"),e("#checkIn").focus(),!1):(t("Ingresa el número de documento","error"),e("#numDocumento").focus(),!1):(t("Ingresa el nombre del cliente","error"),e("#nombreCliente").focus(),!1):(t("Selecciona una habitación","error"),e("#nhabitacion").focus(),!1)}function H(){e("#regForm")[0].reset(),e("#estadoPago").val("pagado"),e("#tipoDocumento").val("DNI"),e("#diasReservados").val("1"),e("#moneda").val("Soles"),e("#metodoPago").val("Tarjeta"),e("#desayuno").val("si"),I(),e("#nhabitacion").focus()}function L(o){e("#nhabitacion").val(o);const n=new Date,c=new Date(n.getFullYear(),n.getMonth(),n.getDate(),n.getHours(),n.getMinutes()),a=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1,12,0);e("#checkIn").val(c.toISOString().slice(0,16)),e("#checkOut").val(a.toISOString().slice(0,16)),e("#precio").focus(),t(`Check-in iniciado para habitación ${o}`,"info")}let i=[];async function A(){try{let o=$("habitacionesPanel");o||(o=(await C(D(l,"habitaciones"))).docs.map(c=>({id:c.id,...c.data()})),m("habitacionesPanel",o,300)),i=o,p(),b()}catch(o){console.error("Error cargar habitaciones:",o),e("#roomsGrid").html('<div class="loading-colabs">Error al cargar habitaciones</div>')}}function b(){const o={libre:{texto:"Disponible",icono:"fa-check-circle",color:"#10b981"},ocupado:{texto:"Ocupado",icono:"fa-user-friends",color:"#ef4444"},limpieza:{texto:"Limpieza",icono:"fa-broom",color:"#06b6d4"},fuera:{texto:"Fuera",icono:"fa-tools",color:"#f59e0b"}},n=e("#roomsGrid");if(n.empty(),i.length===0){n.html('<div class="loading-colabs">No hay habitaciones registradas</div>');return}i.forEach(c=>{const a=c.estado||"libre",r=o[a],g=(s=>{if(!s)return"";try{return s.toDate?s.toDate().toLocaleDateString("es-PE"):s instanceof Date?s.toLocaleDateString("es-PE"):typeof s=="string"?new Date(s).toLocaleDateString("es-PE"):""}catch{return""}})(c.checkIn),w=e(`
            <div class="room-card ${a}" data-habitacion="${c.numero}" style="--room-color: ${r.color}">
                <div class="room-header">
                    <div class="room-number">${c.numero}</div>
                    <div class="status-badge">
                        <i class="fa-solid ${r.icono}"></i>
                        ${r.texto}
                    </div>
                </div>
                <div class="room-info">
                    <div><strong>${c.tipo||"Individual"}</strong></div>
                    <div>${c.cliente||"Sin huésped"}</div>
                    ${g?`<div><small>Check-in: ${g}</small></div>`:""}
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
                    <button onclick="accionCheckIn('${c.numero}')" 
                            class="btn-estado ${a==="libre"?"activo":""}" 
                            style="background: #10b981; color: white; border: none; padding: 0.4rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; opacity: ${a==="libre"?"1":"0.7"}; flex: 1;">
                        <i class="fa-solid fa-sign-in-alt"></i> Check-in
                    </button>
                    <button onclick="accionCheckOut('${c.numero}')" 
                            class="btn-estado ${a==="ocupado"?"activo":""}" 
                            style="background: #ef4444; color: white; border: none; padding: 0.4rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; opacity: ${a==="ocupado"?"1":"0.7"}; flex: 1;">
                        <i class="fa-solid fa-sign-out-alt"></i> Check-out
                    </button>
                    <button onclick="accionLimpieza('${c.numero}')" 
                            class="btn-estado ${a==="limpieza"?"activo":""}" 
                            style="background: #06b6d4; color: white; border: none; padding: 0.4rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; opacity: ${a==="limpieza"?"1":"0.7"}; flex: 1;">
                        <i class="fa-solid fa-broom"></i> Limpieza
                    </button>
                </div>
            </div>
        `);n.append(w)}),e(".room-card").hover(function(){e(this).find(".estado-botones").css("opacity","1")},function(){e(this).find(".estado-botones").css("opacity","0")})}window.accionCheckIn=function(o){L(o),e("html, body").animate({scrollTop:e(".form-panel").offset().top-100},800)};window.accionCheckOut=async function(o){const n=i.find(r=>r.numero===o);if(!n){t("Habitación no encontrada","error");return}if(!(!confirm(`¿Realizar Check-out de la habitación ${o}?

Cliente: ${n.cliente||"Sin cliente"}
Tipo: ${n.tipo||"Individual"}`)||!confirm(`¿Confirmar Check-out y marcar como DISPONIBLE?

⚠️ Esto:
• Liberará la habitación
• Mantendrá el registro en historial
• Permitirá nuevas reservas

¿Continuar?`)))try{await f(h(l,"habitaciones",o),{estado:"libre",cliente:null,checkOut:new Date,fechaActualizado:u()});const r=i.findIndex(v=>v.numero===o);r!==-1&&(i[r].estado="libre",i[r].cliente=null,m("habitacionesPanel",i,300)),b(),p(),t(`✅ Check-out completado - Habitación ${o} disponible`,"success")}catch(r){console.error("Error check-out:",r),t("Error al realizar check-out","error")}};window.accionLimpieza=async function(o){if(!i.find(a=>a.numero===o)){t("Habitación no encontrada","error");return}if(confirm(`¿Marcar habitación ${o} para LIMPIEZA?

Esto desactivará temporalmente la habitación hasta que termine la limpieza.`))try{await f(h(l,"habitaciones",o),{estado:"limpieza",fechaActualizado:u()});const a=i.findIndex(r=>r.numero===o);a!==-1&&(i[a].estado="limpieza",m("habitacionesPanel",i,300)),b(),p(),t(`🧹 Habitación ${o} en limpieza`,"success")}catch(a){console.error("Error limpieza:",a),t("Error al marcar para limpieza","error")}};function p(){const o=e("#nhabitacion");if(o.length===0)return;const c='<option value="">Selecciona habitación...</option>'+i.filter(a=>a.estado==="libre").map(a=>`<option value="${a.numero}">Hab ${a.numero} - ${a.tipo||"Individual"} (LIBRE)</option>`).join("");o.html(c)}async function M(){O("habitacionesPanel"),await A(),t("Panel actualizado","success")}export{M as a,j as c,A as h};
