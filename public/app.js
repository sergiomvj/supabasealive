const API_URL = window.location.origin + '/api';

const projectsGrid = document.getElementById('projectsGrid');
const addProjectBtn = document.getElementById('addProjectBtn');
const projectModal = document.getElementById('projectModal');
const closeModal = document.querySelector('.close');
const projectForm = document.getElementById('projectForm');

// State
let projects = [];
let editingId = null;

// Fetch projects
async function fetchProjects() {
    try {
        const response = await fetch(`${API_URL}/projects`);
        projects = await response.json();
        renderProjects();
    } catch (error) {
        console.error('Error fetching projects:', error);
        projectsGrid.innerHTML = '<div class="loader">Failed to load projects. Is the server running?</div>';
    }
}

// Render projects
function renderProjects() {
    if (projects.length === 0) {
        projectsGrid.innerHTML = '<div class="loader">No projects registered yet. Click "Add Project" to start.</div>';
        return;
    }

    projectsGrid.innerHTML = projects.map(p => `
        <div class="glass-card project-card">
            <div class="project-header">
                <h3>${p.name}</h3>
                <span class="status-badge status-${p.status}">${p.status === 'active' ? 'Active' : 'Error'}</span>
            </div>
            <div class="project-info">
                <p><i class="fas fa-link"></i> ${p.supabase_url}</p>
            </div>
            <div class="project-meta">
                <div class="meta-item">
                    <span>Frequency</span>
                    <strong>${p.frequency_hours}h</strong>
                </div>
                <div class="meta-item">
                    <span>Last Heartbeat</span>
                    <strong>${p.last_heartbeat ? new Date(p.last_heartbeat).toLocaleTimeString() : 'Never'}</strong>
                </div>
            </div>
            <div class="project-actions">
                <button onclick="editProject(${p.id})" class="btn btn-outline">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="testHeartbeat(${p.id})" class="btn btn-outline">
                    <i class="fas fa-bolt"></i> Send Now
                </button>
                <button onclick="deleteProject(${p.id})" class="btn btn-outline btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Add project
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectData = {
        name: document.getElementById('pName').value,
        supabase_url: document.getElementById('pUrl').value,
        supabase_key: document.getElementById('pKey').value,
        frequency_hours: parseInt(document.getElementById('pFreq').value)
    };

    try {
        const url = editingId ? `${API_URL}/projects/${editingId}` : `${API_URL}/projects`;
        const method = editingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            projectModal.style.display = 'none';
            projectForm.reset();
            editingId = null;
            fetchProjects();
        }
    } catch (error) {
        alert('Error saving project');
    }
});

// Edit project
function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    editingId = id;
    document.getElementById('pName').value = project.name;
    document.getElementById('pUrl').value = project.supabase_url;
    document.getElementById('pKey').value = project.supabase_key;
    document.getElementById('pFreq').value = project.frequency_hours;

    document.querySelector('.modal-header h3').innerText = 'Edit Project';
    document.querySelector('.modal-footer button').innerText = 'Update Project';
    projectModal.style.display = 'block';
}

// Test heartbeat
async function testHeartbeat(id) {
    try {
        const response = await fetch(`${API_URL}/projects/${id}/heartbeat`, { method: 'POST' });
        if (response.ok) {
            alert('Heartbeat sent successfully!');
            fetchProjects();
        } else {
            alert('Failed to send heartbeat. Check if the "alive" table exists.');
        }
    } catch (error) {
        alert('Error sending heartbeat');
    }
}

// Delete project
async function deleteProject(id) {
    if (!confirm('Are you sure you want to remove this project?')) return;

    try {
        await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
        fetchProjects();
    } catch (error) {
        alert('Error deleting project');
    }
}

// Modal Toggle
addProjectBtn.onclick = () => {
    editingId = null;
    projectForm.reset();
    document.querySelector('.modal-header h3').innerText = 'Register New Project';
    document.querySelector('.modal-footer button').innerText = 'Save Project';
    projectModal.style.display = 'block';
};
closeModal.onclick = () => projectModal.style.display = 'none';
window.onclick = (event) => {
    if (event.target === projectModal) projectModal.style.display = 'none';
}

// Init
fetchProjects();
setInterval(fetchProjects, 30000); // Refresh every 30s
