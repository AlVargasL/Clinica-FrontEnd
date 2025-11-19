// Variable global para guardar la prioridad seleccionada
let prioridadSeleccionada = 'MEDIA';

// -------------------------------------------------------
//  REGISTRAR PACIENTE
// -------------------------------------------------------
const btnReg = document.getElementById('btnReg');
if (btnReg) {
  btnReg.addEventListener('click', async () => {
    try {
      const nombre = document.getElementById('nombre').value;
      const apellidos = document.getElementById('apellidos').value;
      const edad = Number(document.getElementById('edad').value || 0);
      const telefono = document.getElementById('telefono').value;

      if (!nombre || !apellidos) {
        document.getElementById('resReg').textContent = 'Error: Nombre y apellidos son obligatorios';
        return;
      }

      const res = await fetch('http://localhost:8080/api/pacientes/registro', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ nombre, apellidos, edad, telefono })
      });

      const data = await res.json();
      document.getElementById('resReg').textContent = 
        `✓ Paciente registrado exitosamente\nID: ${data.id}\nNombre: ${data.nombre} ${data.apellidos}`;
      
      // Limpiar formulario
      document.getElementById('nombre').value = '';
      document.getElementById('apellidos').value = '';
      document.getElementById('edad').value = '';
      document.getElementById('telefono').value = '';
    } catch (e) {
      document.getElementById('resReg').textContent = 'Error: ' + e.message;
    }
  });
}

// -------------------------------------------------------
//  MANEJAR DROPDOWN DE PRIORIDAD
// -------------------------------------------------------
const dropdownItems = document.querySelectorAll('.dropdown-menu .dropdown-item');
dropdownItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    prioridadSeleccionada = e.target.textContent.trim();
    document.querySelector('.prioridad').textContent = prioridadSeleccionada;
  });
});

// -------------------------------------------------------
//  SOLICITAR CITA
// -------------------------------------------------------
const btnCita = document.getElementById('btnCita');
if (btnCita) {
  btnCita.addEventListener('click', async () => {
    try {
      const pacienteId = Number(document.getElementById('idPaciente').value);
      const motivo = document.getElementById('motivo').value;

      if (!pacienteId || !motivo) {
        document.getElementById('resCita').textContent = 'Error: ID de paciente y motivo son obligatorios';
        return;
      }

      // Obtener paciente
      const pRes = await fetch('http://localhost:8080/api/pacientes/' + pacienteId);
      if (!pRes.ok) {
        document.getElementById('resCita').textContent = 'Error: Paciente no encontrado';
        return;
      }

      const paciente = await pRes.json();

      // Solicitar cita
      const res = await fetch('http://localhost:8080/api/citas/solicitar', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ 
          paciente, 
          motivo, 
          prioridad: prioridadSeleccionada 
        })
      });

      const data = await res.json();
      document.getElementById('resCita').textContent = 
        `✓ Cita solicitada exitosamente\n` +
        `ID Cita: ${data.id}\n` +
        `Paciente: ${data.paciente.nombre} ${data.paciente.apellidos}\n` +
        `Motivo: ${data.motivo}\n` +
        `Prioridad: ${data.prioridad}`;
      
      // Limpiar formulario
      document.getElementById('idPaciente').value = '';
      document.getElementById('motivo').value = '';
      prioridadSeleccionada = 'MEDIA';
      document.querySelector('.prioridad').textContent = 'Prioridad';
    } catch (e) {
      document.getElementById('resCita').textContent = 'Error: ' + e.message;
    }
  });
}

// -------------------------------------------------------
//  ATENDER SIGUIENTE CITA
// -------------------------------------------------------
const btnAtender = document.getElementById('btnAtender');
if (btnAtender) {
  btnAtender.addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:8080/api/citas/atender', {
        method: 'POST'
      });

      if (res.status === 204) {
        document.getElementById('resAtender').textContent = 'ℹ No hay citas pendientes';
        return;
      }

      const data = await res.json();
      document.getElementById('resAtender').textContent = 
        `✓ Paciente atendido\n` +
        `ID Cita: ${data.id}\n` +
        `Paciente: ${data.paciente.nombre} ${data.paciente.apellidos}\n` +
        `Motivo: ${data.motivo}\n` +
        `Prioridad: ${data.prioridad}`;
    } catch (e) {
      document.getElementById('resAtender').textContent = 'Error: ' + e.message;
    }
  });
}

// -------------------------------------------------------
//  VER ÚLTIMO ATENDIDO
// -------------------------------------------------------
const btnUltimo = document.getElementById('btnUltimo');
if (btnUltimo) {
  btnUltimo.addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:8080/api/citas/ultimo');
      const data = await res.json();
      
      if (!data) {
        document.getElementById('resUltimo').textContent = 'ℹ No se ha atendido ningún paciente aún';
        return;
      }

      document.getElementById('resUltimo').textContent = 
        `Último paciente atendido:\n` +
        `Paciente: ${data.paciente.nombre} ${data.paciente.apellidos}\n` +
        `Motivo: ${data.motivo}\n` +
        `Prioridad: ${data.prioridad}`;
    } catch (e) {
      document.getElementById('resUltimo').textContent = 'Error: ' + e.message;
    }
  });
}

// -------------------------------------------------------
//  LISTAR PACIENTES
// -------------------------------------------------------
const btnListar = document.getElementById('btnListar');
if (btnListar) {
  btnListar.addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:8080/api/pacientes');
      const data = await res.json();
      
      const tbody = document.getElementById('tablaPacientes');
      if (!tbody) return;

      if (data.size === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay pacientes registrados</td></tr>';
        return;
      }

      let html = '';
      for (let i = 0; i < data.size; i++) {
        const p = data.data[i];
        html += `
          <tr>
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>${p.apellidos}</td>
            <td>${p.edad}</td>
            <td>${p.telefono}</td>
          </tr>
        `;
      }
      tbody.innerHTML = html;
    } catch (e) {
      console.error('Error al listar pacientes:', e);
    }
  });
}

// -------------------------------------------------------
//  ACTIVAR LINK CORRESPONDIENTE SEGÚN LA URL
// -------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const currentPage = window.location.pathname.split("/").pop() || 'index.html';

  navLinks.forEach(link => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
});