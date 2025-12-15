const API_BASE = "http://localhost:8080/api";

let currentEntity = "departments";
let data = [];
let editingId = null;

// CONFIG — MUST MATCH YOUR ENTITY FIELD NAMES
const config = {
  departments: {
    id: "deptId",
    fields: ["deptName", "location", "phone"],
  },
  doctors: {
    id: "doctorId",
    fields: ["firstName", "lastName", "specialization", "email", "deptId"],
  },
  patients: {
    id: "patientId",
    fields: ["firstName", "lastName", "email", "phone", "dateOfBirth"],
  },
  appointments: {
    id: "appointmentId",
    fields: [
      "patientId",
      "doctorId",
      "appointmentDate",
      "appointmentTime",
      "status",
    ],
  },
};

async function loadEntity(entity) {
  currentEntity = entity;
  editingId = null;
  document.getElementById("pageTitle").innerText =
    entity.charAt(0).toUpperCase() + entity.slice(1);

  const res = await fetch(`${API_BASE}/${entity}`);
  data = await res.json();
  renderTable();
}

function renderTable() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const { id, fields } = config[currentEntity];

  let html = `<table><thead><tr><th>ID</th>`;
  fields.forEach((f) => (html += `<th>${f}</th>`));
  html += `<th>Actions</th></tr></thead><tbody>`;

  data
    .filter((row) =>
      fields.some((f) =>
        String(row[f] ?? "")
          .toLowerCase()
          .includes(search)
      )
    )
    .forEach((row) => {
      html += `<tr><td>${row[id]}</td>`;
      fields.forEach((f) => (html += `<td>${row[f] ?? ""}</td>`));
      html += `
        <td>
          <button class="action-btn" onclick="edit(${row[id]})">Edit</button>
          <button class="action-btn" onclick="remove(${row[id]})">Delete</button>
        </td>
      </tr>`;
    });

  html += `</tbody></table>`;
  document.getElementById("tableContainer").innerHTML = html;
}

function openForm(row = {}) {
  editingId = row[config[currentEntity].id] ?? null;
  document.getElementById("formTitle").innerText = editingId
    ? "Edit Record"
    : "Add Record";

  const form = document.getElementById("entityForm");
  form.innerHTML = "";

  config[currentEntity].fields.forEach((field) => {
    form.innerHTML += `
      <label>${field}</label>
      <input name="${field}" value="${row[field] ?? ""}">
    `;
  });

  document.getElementById("formContainer").classList.remove("hidden");
}

function closeForm() {
  document.getElementById("formContainer").classList.add("hidden");
  editingId = null;
}

function edit(id) {
  const row = data.find((r) => r[config[currentEntity].id] === id);
  openForm(row);
}

async function save() {
  const { id, fields } = config[currentEntity];
  const obj = {};

  fields.forEach((f) => {
    obj[f] = document.querySelector(`[name="${f}"]`).value;
  });

  let method = "POST";
  let url = `${API_BASE}/${currentEntity}`;

  if (editingId) {
    method = "PUT";
    url = `${API_BASE}/${currentEntity}/${editingId}`;
    obj[id] = editingId;
  }

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  });

  closeForm();
  loadEntity(currentEntity);
}

async function remove(id) {
  if (!confirm("Are you sure you want to delete this record?")) return;
  await fetch(`${API_BASE}/${currentEntity}/${id}`, { method: "DELETE" });
  loadEntity(currentEntity);
}

// Load default page
loadEntity("departments");
