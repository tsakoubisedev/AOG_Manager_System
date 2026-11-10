const teams = ["General", "Pastor", "Youth Pastor", "Worshiper", "Usher", "Band", "Sound Team"];
const members = [
    { id: 1, firstName: "Ama", lastName: "Mensah", email: "ama.mensah@example.com", phone: "024 555 0182", team: "Worshiper", active: true, attendance: 18, lastAttended: "2026-11-08" },
    { id: 2, firstName: "Kojo", lastName: "Asante", email: "kojo.asante@example.com", phone: "020 321 4407", team: "Band", active: true, attendance: 15, lastAttended: "2026-11-08" },
    { id: 3, firstName: "Abena", lastName: "Owusu", email: "abena.owusu@example.com", phone: "027 660 2174", team: "Usher", active: true, attendance: 21, lastAttended: "2026-11-08" },
    { id: 4, firstName: "Kwame", lastName: "Boateng", email: "kwame.boateng@example.com", phone: "055 814 6063", team: "Pastor", active: true, attendance: 24, lastAttended: "2026-11-08" },
    { id: 5, firstName: "Esi", lastName: "Addo", email: "esi.addo@example.com", phone: "024 710 3391", team: "Youth Pastor", active: true, attendance: 12, lastAttended: "2026-11-01" },
    { id: 6, firstName: "Yaw", lastName: "Ofori", email: "yaw.ofori@example.com", phone: "050 922 1058", team: "Sound Team", active: true, attendance: 9, lastAttended: "2026-11-08" },
    { id: 7, firstName: "Akosua", lastName: "Appiah", email: "akosua.appiah@example.com", phone: "026 481 8802", team: "General", active: false, attendance: 6, lastAttended: "2026-10-25" },
    { id: 8, firstName: "Kofi", lastName: "Agyeman", email: "kofi.agyeman@example.com", phone: "059 104 7702", team: "Usher", active: true, attendance: 17, lastAttended: "2026-11-08" },
    { id: 9, firstName: "Nana", lastName: "Darko", email: "nana.darko@example.com", phone: "024 609 7732", team: "Worshiper", active: true, attendance: 13, lastAttended: "2026-11-08" }
];

const elements = {
    search: document.getElementById("searchInput"),
    filters: document.getElementById("teamFilters"),
    list: document.getElementById("membersList"),
    empty: document.getElementById("membersEmpty"),
    count: document.getElementById("membersCount"),
    total: document.getElementById("statTotal"),
    active: document.getElementById("statActive"),
    attendance: document.getElementById("statAttendance"),
    memberOverlay: document.getElementById("memberOverlay"),
    memberForm: document.getElementById("memberForm"),
    memberTitle: document.getElementById("memberDialogTitle"),
    memberTeam: document.getElementById("memberTeam"),
    attendanceOverlay: document.getElementById("attendanceOverlay"),
    attendanceForm: document.getElementById("attendanceForm"),
    attendanceMembers: document.getElementById("attendanceMembers"),
    serviceDate: document.getElementById("serviceDate"),
    toast: document.getElementById("toast")
};

let selectedTeam = "All teams";
let editingId = null;
let nextId = Math.max(...members.map(member => member.id)) + 1;
let toastTimer;

function initials(member) {
    return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
}

function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function renderFilters() {
    elements.filters.replaceChildren();
    ["All teams", ...teams].forEach(team => {
        const button = makeElement("button", "team-chip", team);
        button.type = "button";
        button.setAttribute("aria-pressed", String(selectedTeam === team));
        button.addEventListener("click", () => {
            selectedTeam = team;
            render();
        });
        elements.filters.append(button);
    });
}

function renderMembers() {
    const query = elements.search.value.trim().toLowerCase();
    const shown = members.filter(member => {
        const name = `${member.firstName} ${member.lastName}`.toLowerCase();
        return (selectedTeam === "All teams" || member.team === selectedTeam)
            && (!query || name.includes(query) || member.email.toLowerCase().includes(query));
    });

    elements.list.replaceChildren();
    shown.forEach((member, index) => {
        const card = makeElement("article", "member-card");
        card.setAttribute("role", "listitem");
        const top = makeElement("div", "member-card__top");
        top.append(makeElement("span", `avatar avatar--${index % 4}`, initials(member)));
        const identity = makeElement("div");
        identity.append(makeElement("h3", "member-card__name", `${member.firstName} ${member.lastName}`));
        identity.append(makeElement("p", "member-card__email", member.email || "No email added"));
        top.append(identity);
        card.append(top);

        const details = makeElement("div", "member-card__details");
        details.append(makeElement("span", "team-tag", member.team));
        details.append(makeElement("span", member.active ? "status" : "status status--inactive", member.active ? "Active" : "Inactive"));
        card.append(details);

        const actions = makeElement("div", "member-card__actions");
        const edit = makeElement("button", "text-button", "Edit details");
        edit.type = "button";
        edit.addEventListener("click", () => openMemberForm(member));
        actions.append(edit);
        const remove = makeElement("button", "text-button text-button--danger", "Remove");
        remove.type = "button";
        remove.addEventListener("click", () => removeMember(member));
        actions.append(remove);
        card.append(actions);
        elements.list.append(card);
    });
    elements.count.textContent = `${shown.length} shown`;
    elements.empty.hidden = shown.length > 0;
}

function renderStats() {
    elements.total.textContent = String(members.length);
    elements.active.textContent = String(members.filter(member => member.active).length);
    elements.attendance.textContent = String(members.reduce((total, member) => total + member.attendance, 0));
}

function render() {
    renderFilters();
    renderMembers();
    renderStats();
}

function openOverlay(overlay) {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    const firstInput = overlay.querySelector("input:not([type=checkbox])");
    if (firstInput) firstInput.focus();
}

function closeOverlay(overlay) {
    overlay.hidden = true;
    if (elements.memberOverlay.hidden && elements.attendanceOverlay.hidden) {
        document.body.style.overflow = "";
    }
}

function openMemberForm(member) {
    editingId = member ? member.id : null;
    elements.memberForm.reset();
    elements.memberTitle.textContent = member ? "Edit member" : "Add member";
    elements.memberTeam.replaceChildren(...teams.map(team => {
        const option = document.createElement("option");
        option.value = team;
        option.textContent = team;
        return option;
    }));

    if (member) {
        Object.entries(member).forEach(([key, value]) => {
            const field = elements.memberForm.elements.namedItem(key);
            if (!field) return;
            if (field.type === "checkbox") field.checked = value;
            else field.value = value;
        });
    } else {
        elements.memberForm.elements.namedItem("active").checked = true;
    }
    openOverlay(elements.memberOverlay);
}

function removeMember(member) {
    if (!window.confirm(`Remove ${member.firstName} ${member.lastName} from this demo?`)) return;
    members.splice(members.findIndex(item => item.id === member.id), 1);
    render();
    showToast(`${member.firstName} was removed from the demo.`);
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("toast--visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("toast--visible"), 2800);
}

function openAttendanceForm() {
    if (!members.some(member => member.active)) {
        showToast("Add an active member before recording attendance.");
        return;
    }
    elements.attendanceForm.reset();
    elements.serviceDate.value = new Date().toISOString().slice(0, 10);
    elements.attendanceMembers.replaceChildren();
    members.filter(member => member.active).forEach(member => {
        const label = makeElement("label", "attendance-choice");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "attendees";
        checkbox.value = String(member.id);
        label.append(checkbox, document.createTextNode(`${member.firstName} ${member.lastName}`));
        elements.attendanceMembers.append(label);
    });
    openOverlay(elements.attendanceOverlay);
}

document.getElementById("addMemberBtn").addEventListener("click", () => openMemberForm(null));
document.getElementById("recordAttendanceBtn").addEventListener("click", openAttendanceForm);
elements.search.addEventListener("input", renderMembers);

elements.memberForm.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(elements.memberForm);
    const details = {
        firstName: String(data.get("firstName")).trim(),
        lastName: String(data.get("lastName")).trim(),
        email: String(data.get("email")).trim(),
        phone: String(data.get("phone")).trim(),
        team: String(data.get("team")),
        active: data.get("active") === "on"
    };
    if (!details.firstName || !details.lastName) return;

    if (editingId === null) {
        members.unshift({ id: nextId++, ...details, attendance: 0, lastAttended: "" });
    } else {
        const member = members.find(item => item.id === editingId);
        Object.assign(member, details);
    }
    closeOverlay(elements.memberOverlay);
    render();
    showToast(editingId === null ? "Member added to the demo." : "Member details updated.");
});

elements.attendanceForm.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(elements.attendanceForm);
    const attendeeIds = data.getAll("attendees").map(Number);
    if (attendeeIds.length === 0) {
        showToast("Select at least one member to save attendance.");
        return;
    }
    attendeeIds.forEach(id => {
        const member = members.find(item => item.id === id);
        if (member) {
            member.attendance += 1;
            member.lastAttended = String(data.get("date"));
        }
    });
    closeOverlay(elements.attendanceOverlay);
    render();
    showToast(`${attendeeIds.length} ${attendeeIds.length === 1 ? "attendance" : "attendances"} recorded for ${String(data.get("service"))}.`);
});

document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => closeOverlay(document.getElementById(button.dataset.close)));
});
document.querySelectorAll(".overlay").forEach(overlay => {
    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeOverlay(overlay);
    });
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeOverlay(elements.memberOverlay);
        closeOverlay(elements.attendanceOverlay);
    }
});

render();
