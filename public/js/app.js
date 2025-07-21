// Variables globales
let isEditing = false;
let currentUserId = null;

// Elementos del DOM
const userForm = document.getElementById('userForm');
const formTitle = document.getElementById('formTitle');
const cancelBtn = document.getElementById('cancelBtn');
const usersTableBody = document.getElementById('usersTableBody');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    
    userForm.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
});

// Cargar todos los usuarios
async function loadUsers() {
    console.log('Cargando usuarios...');
    try {
        const response = await fetch('/api/users');
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error en la respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            throw new Error(errorData.message || `Error al cargar usuarios: ${response.status} ${response.statusText}`);
        }
        
        const users = await response.json();
        console.log('Usuarios recibidos:', users);
        
        usersTableBody.innerHTML = '';
        
        if (!Array.isArray(users)) {
            console.error('La respuesta no es un array:', users);
            throw new Error('Formato de datos inválido recibido del servidor');
        }
        
        if (users.length === 0) {
            console.log('No hay usuarios registrados');
            usersTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No hay usuarios registrados</td></tr>';
            return;
        }
        
        users.forEach(user => {
            try {
                // Escapar comillas simples en los valores para evitar errores de JavaScript
                const safeUsername = String(user.username || '').replace(/'/g, "\\'");
                const safeEmail = String(user.email || '').replace(/'/g, "\\'");
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id || 'N/A'}</td>
                    <td>${safeUsername}</td>
                    <td>${safeEmail}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-warning me-2" onclick="editUser(${user.id}, '${safeUsername}', '${safeEmail}')">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            } catch (userError) {
                console.error('Error al procesar usuario:', user, userError);
            }
        });
        
        console.log('Tabla de usuarios actualizada correctamente');
    } catch (error) {
        console.error('Error en loadUsers:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        showAlert(`Error al cargar los usuarios: ${error.message}`, 'danger');
    }
}

// Manejar envío del formulario (crear/actualizar)
async function handleSubmit(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    
    console.log('Enviando formulario con datos:', { username, email, isEditing, currentUserId });
    
    // Validación básica
    if (!username || !email) {
        const errorMsg = 'Por favor completa todos los campos';
        console.warn(errorMsg);
        showAlert(errorMsg, 'warning');
        return;
    }
    
    const userData = { username, email };
    
    try {
        let response;
        
        if (isEditing) {
            // Actualizar usuario existente
            response = await fetch(`/api/users/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            let result = await response.json();
            console.log('Respuesta del servidor (actualizar):', { status: response.status, result });
            
            if (!response.ok) {
                const errorMsg = result.message || 'Error al actualizar el usuario';
                console.error('Error al actualizar usuario:', errorMsg);
                throw new Error(errorMsg);
            }
            
            showAlert('Usuario actualizado correctamente', 'success');
        } else {
            // Crear nuevo usuario
            response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            console.log('Respuesta del servidor (crear):', { status: response.status, result });
            
            if (!response.ok) {
                const errorMsg = result.message || 'Error al crear el usuario';
                console.error('Error al crear usuario:', errorMsg);
                throw new Error(errorMsg);
            }
            
            showAlert('Usuario creado correctamente', 'success');
        }
        
        // Limpiar formulario y recargar lista
        userForm.reset();
        cancelEdit();
        loadUsers();
        
    } catch (error) {
        console.error('Error en handleSubmit:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            isEditing,
            currentUserId
        });
        showAlert(`Error: ${error.message}`, 'danger');
    }
}

// Editar usuario
window.editUser = function(id, username, email) {
    isEditing = true;
    currentUserId = id;
    
    // Llenar el formulario con los datos del usuario
    document.getElementById('username').value = username;
    document.getElementById('email').value = email;
    
    // Actualizar la interfaz
    formTitle.textContent = 'Editar Usuario';
    cancelBtn.style.display = 'inline-block';
    
    // Desplazarse al formulario
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

// Eliminar usuario
window.deleteUser = async function(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar el usuario');
        }
        
        showAlert('Usuario eliminado correctamente', 'success');
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al eliminar el usuario', 'danger');
    }
}

// Cancelar edición
function cancelEdit() {
    isEditing = false;
    currentUserId = null;
    userForm.reset();
    formTitle.textContent = 'Agregar Nuevo Usuario';
    cancelBtn.style.display = 'none';
}

// Mostrar alerta
function showAlert(message, type) {
    // Eliminar alertas anteriores
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insertar después del título
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Eliminar la alerta después de 5 segundos
    setTimeout(() => {
        if (alertDiv) {
            alertDiv.remove();
        }
    }, 5000);
}
