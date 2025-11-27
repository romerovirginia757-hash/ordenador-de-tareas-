// ELEMENTOS
const activityForm = document.getElementById("activityForm");
const activityTable = document.getElementById("activityTable");
const searchBar = document.getElementById("searchBar");
const btnToggleTheme = document.getElementById("btnToggleTheme");

const editModal = document.getElementById("editModal");
const closeModal = document.getElementById("closeModal");
const saveEdit = document.getElementById("saveEdit");

let editIndex = null;
let activities = JSON.parse(localStorage.getItem("activities")) || [];

renderActivities();

// AGREGAR ACTIVIDAD
activityForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const task = document.getElementById("task").value.trim();
    const girlAssigned = document.getElementById("girlAssigned").value;
    const date = document.getElementById("date").value;
    const comments = document.getElementById("comments").value.trim();

    if (!task) return;

    activities.push({
        task,
        girlAssigned,
        date,
        comments,
        completed: false
    });

    localStorage.setItem("activities", JSON.stringify(activities));
    activityForm.reset();
    renderActivities();
});

// RENDER
function renderActivities(filter = "all", search = "") {
    activityTable.innerHTML = "";

    let filtered = activities.filter(a => {
        if (filter === "completed") return a.completed;
        if (filter === "pending") return !a.completed;
        return true;
    });

    const s = search.toLowerCase().trim();
    if (s) {
        filtered = filtered.filter(a =>
            (a.task || "").toLowerCase().includes(s) ||
            (a.girlAssigned || "").toLowerCase().includes(s) ||
            (a.comments || "").toLowerCase().includes(s)
        );
    }

    filtered.forEach((activity, index) => {
        const row = document.createElement("tr");

        // marcar fila visualmente si está completada
        const completedClass = activity.completed ? "row-completed" : "";

        row.innerHTML = `
            <td class="${completedClass}">${escapeHtml(activity.task)}</td>
            <td class="${completedClass}">${escapeHtml(activity.girlAssigned)}</td>
            <td class="${completedClass}">${escapeHtml(activity.date)}</td>
            <td class="${completedClass}">${escapeHtml(activity.comments)}</td>
            <td>
                <input type="checkbox" ${activity.completed ? "checked" : ""} data-index="${index}">
            </td>
            <td>
                <button class="editBtn" data-index="${index}">✏️</button>
                <button class="deleteBtn" data-index="${index}">🗑️</button>
            </td>
        `;
        activityTable.appendChild(row);
    });

    updateStats();
}

// seguridad: escapar texto para evitar HTML injection
function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// CAMBIOS EN CHECKBOX (completado)
document.addEventListener("change", (e) => {
    if (e.target.type === "checkbox" && e.target.dataset.index !== undefined) {
        const index = Number(e.target.dataset.index);
        activities[index].completed = e.target.checked;
        localStorage.setItem("activities", JSON.stringify(activities));
        renderActivities(document.querySelector(".btn-filter.active")?.dataset.filter || "all", searchBar.value);
    }
});

// BORRAR
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("deleteBtn")) {
        const index = Number(e.target.dataset.index);
        if (!Number.isNaN(index)) {
            activities.splice(index, 1);
            localStorage.setItem("activities", JSON.stringify(activities));
            renderActivities(document.querySelector(".btn-filter.active")?.dataset.filter || "all", searchBar.value);
        }
    }
});

// EDITAR (abrir modal)
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("editBtn")) {
        editIndex = Number(e.target.dataset.index);
        const a = activities[editIndex];

        document.getElementById("editTask").value = a.task;
        document.getElementById("editGirlAssigned").value = a.girlAssigned;
        document.getElementById("editDate").value = a.date;
        document.getElementById("editComments").value = a.comments;

        editModal.style.display = "flex";
        editModal.setAttribute("aria-hidden", "false");
    }
});

// cerrar modal
closeModal.addEventListener("click", () => {
    editModal.style.display = "none";
    editModal.setAttribute("aria-hidden", "true");
});

// guardar edición
saveEdit.addEventListener("click", () => {
    if (editIndex === null) return;

    activities[editIndex].task = document.getElementById("editTask").value.trim();
    activities[editIndex].girlAssigned = document.getElementById("editGirlAssigned").value;
    activities[editIndex].date = document.getElementById("editDate").value;
    activities[editIndex].comments = document.getElementById("editComments").value.trim();

    localStorage.setItem("activities", JSON.stringify(activities));
    renderActivities(document.querySelector(".btn-filter.active")?.dataset.filter || "all", searchBar.value);

    editModal.style.display = "none";
    editModal.setAttribute("aria-hidden", "true");
    editIndex = null;
});

// FILTROS
document.querySelectorAll(".btn-filter").forEach(btn => {
    btn.addEventListener("click", () => {
        const active = document.querySelector(".btn-filter.active");
        if (active) active.classList.remove("active");
        btn.classList.add("active");
        renderActivities(btn.dataset.filter, searchBar.value);
    });
});

// BUSCADOR
searchBar.addEventListener("input", () => {
    const filter = document.querySelector(".btn-filter.active")?.dataset.filter || "all";
    renderActivities(filter, searchBar.value);
});

// ESTADISTICAS
function updateStats() {
    document.getElementById("totalCount").textContent = activities.length;
    document.getElementById("completedCount").textContent = activities.filter(a => a.completed).length;
    document.getElementById("pendingCount").textContent = activities.filter(a => !a.completed).length;
}

// TEMA
btnToggleTheme.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    btnToggleTheme.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});
