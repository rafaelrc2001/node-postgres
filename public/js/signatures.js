// Variables globales
let isEditing = false;
let currentSignatureId = null;
let signaturePad;

// Elementos del DOM
const signatureForm = document.getElementById('signatureForm');
const formTitle = document.getElementById('formTitle');
const cancelBtn = document.getElementById('cancelBtn');
const signaturesTableBody = document.getElementById('signaturesTableBody');
const signatureCanvas = document.getElementById('signatureCanvas');
const clearSignatureBtn = document.getElementById('clearSignature');
const saveSignatureBtn = document.getElementById('saveSignature');
const signatureDataInput = document.getElementById('signatureData');
const signaturePreview = document.getElementById('signaturePreview');
const viewSignatureModal = new bootstrap.Modal(document.getElementById('viewSignatureModal'));

// Inicializar SignaturePad
function initSignaturePad() {
    signaturePad = new SignaturePad(signatureCanvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 1,
        maxWidth: 3,
        throttle: 16,
    });

    // Ajustar el canvas al tamaño del contenedor
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        signatureCanvas.width = signatureCanvas.offsetWidth * ratio;
        signatureCanvas.height = signatureCanvas.offsetHeight * ratio;
        signatureCanvas.getContext('2d').scale(ratio, ratio);
        signaturePad.clear(); // Limpiar el canvas después de redimensionar
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initSignaturePad();
    loadSignatures();
    
    // Manejar envío del formulario
    signatureForm.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
    
    // Manejar clic en el botón de guardar firma
    saveSignatureBtn.addEventListener('click', saveSignature);
    
    // Limpiar el canvas
    clearSignatureBtn.addEventListener('click', () => {
        signaturePad.clear();
    });
    
    // Guardar la firma como imagen
    saveSignatureBtn.addEventListener('click', saveSignature);
    
    // Búsqueda en tiempo real
    const searchInput = document.getElementById('searchSignature');
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1; // Resetear a la primera página al buscar
            renderSignatures();
        }, 300); // Retraso de 300ms para evitar múltiples renderizados
    });
    
    // Manejar tecla Enter en la búsqueda
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            currentPage = 1;
            renderSignatures();
        }
    });
    
    // Manejar clic en botones de paginación
    document.getElementById('prevPage')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderSignatures();
            window.scrollTo({ top: document.querySelector('.signatures-container').offsetTop - 20, behavior: 'smooth' });
        }
    });
    
    document.getElementById('nextPage')?.addEventListener('click', (e) => {
        e.preventDefault();
        const totalPages = Math.ceil(filterSignatures().length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderSignatures();
            window.scrollTo({ top: document.querySelector('.signatures-container').offsetTop - 20, behavior: 'smooth' });
        }
    });
});

// Guardar la firma como imagen en formato base64
function saveSignature() {
    try {
        if (signaturePad.isEmpty()) {
            showAlert('Por favor, dibuja tu firma primero', 'warning');
            return false;
        }

        // Convertir la firma a una imagen en formato base64
        const signatureData = signaturePad.toDataURL('image/png');
        
        // Actualizar el input oculto con los datos de la firma
        signatureDataInput.value = signatureData;
        
        // Actualizar la vista previa
        const previewContainer = document.querySelector('.signature-preview-container');
        previewContainer.innerHTML = `
            <strong>Firma guardada:</strong>
            <div class="mt-2">
                <img src="${signatureData}" class="img-thumbnail signature-preview-img" alt="Vista previa de la firma">
                <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="clearSavedSignature()">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </div>
        `;
        
        // Mostrar el contenedor de vista previa
        previewContainer.style.display = 'block';
        
        showAlert('Firma guardada correctamente', 'success');
        console.log('Firma guardada:', signatureData.substring(0, 50) + '...');
        return true;
    } catch (error) {
        console.error('Error al guardar la firma:', error);
        showAlert('Error al guardar la firma', 'danger');
        return false;
    }
}

// Limpiar la firma guardada
function clearSavedSignature() {
    try {
        const previewContainer = document.querySelector('.signature-preview-container');
        previewContainer.innerHTML = `
            <strong>Firma guardada:</strong>
            <div class="mt-2">
                <p class="text-muted">No hay firma guardada</p>
            </div>
        `;
        signatureDataInput.value = '';
        signaturePad.clear();
    } catch (error) {
        console.error('Error al limpiar la firma:', error);
        showAlert('Error al limpiar la firma', 'danger');
    }
}

// Variables para paginación y búsqueda
let allSignatures = [];
let currentPage = 1;
const itemsPerPage = 6;

// Cargar todas las firmas
async function loadSignatures() {
    try {
        const response = await fetch('/api/signatures');
        
        if (!response.ok) {
            throw new Error('Error al cargar las firmas');
        }
        
        allSignatures = await response.json();
        currentPage = 1; // Resetear a la primera página
        renderSignatures();
    } catch (error) {
        console.error('Error al cargar firmas:', error);
        showAlert('Error al cargar las firmas', 'danger');
    }
}

// Filtrar firmas por término de búsqueda
function filterSignatures(searchTerm = '') {
    if (!searchTerm.trim()) {
        return allSignatures;
    }
    
    const term = searchTerm.toLowerCase();
    return allSignatures.filter(signature => 
        signature.name.toLowerCase().includes(term) ||
        signature.id.toString().includes(term)
    );
}

// Renderizar las firmas en la cuadrícula
function renderSignatures() {
    const searchTerm = document.getElementById('searchSignature').value;
    const filteredSignatures = filterSignatures(searchTerm);
    const signaturesGrid = document.getElementById('signaturesGrid');
    const noSignaturesMessage = document.getElementById('noSignaturesMessage');
    const paginationContainer = document.getElementById('paginationContainer');
    
    // Mostrar mensaje si no hay firmas
    if (filteredSignatures.length === 0) {
        noSignaturesMessage.style.display = 'block';
        paginationContainer.style.display = 'none';
        return;
    }
    
    noSignaturesMessage.style.display = 'none';
    
    // Calcular la paginación
    const totalPages = Math.ceil(filteredSignatures.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSignatures = filteredSignatures.slice(startIndex, startIndex + itemsPerPage);
    
    // Renderizar las firmas
    signaturesGrid.innerHTML = '';
    
    paginatedSignatures.forEach(signature => {
        const signatureCard = document.createElement('div');
        signatureCard.className = 'col';
        signatureCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="card-title mb-0">${escapeHtml(signature.name)}</h5>
                        <small class="text-muted">#${signature.id}</small>
                    </div>
                    
                    <div class="signature-preview-container mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                        <img src="${signature.signature_image}" 
                             class="img-fluid signature-display" 
                             alt="Firma de ${escapeHtml(signature.name)}"
                             style="max-height: 100px; cursor: pointer;"
                             onclick="viewSignature(${signature.id})">
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            ${new Date(signature.created_at).toLocaleDateString()}
                        </small>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="editSignature('${signature.id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteSignature(${signature.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        signaturesGrid.appendChild(signatureCard);
    });
    
    // Actualizar la paginación
    updatePagination(filteredSignatures.length);
}

// Actualizar la paginación
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'block';
    
    // Actualizar estado de los botones
    prevPageBtn.classList.toggle('disabled', currentPage === 1);
    nextPageBtn.classList.toggle('disabled', currentPage === totalPages);
    
    // Actualizar números de página
    const pageNumbers = document.querySelectorAll('.page-item:not(#prevPage):not(#nextPage)');
    pageNumbers.forEach(el => el.remove());
    
    // Mostrar máximo 5 números de página
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // Insertar números de página
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        
        nextPageBtn.parentNode.insertBefore(pageItem, nextPageBtn);
    }
    
    // Agregar manejadores de eventos
    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page') || this.textContent);
            if (!isNaN(page) && page !== currentPage) {
                currentPage = page;
                renderSignatures();
                window.scrollTo({ top: document.querySelector('.signatures-container').offsetTop - 20, behavior: 'smooth' });
            }
        });
    });
}

// Manejar envío del formulario (crear/actualizar)
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(signatureForm);
    const name = formData.get('name') ? formData.get('name').trim() : '';
    const signatureData = signatureDataInput.value;
    
    console.log('Valor del campo name:', name);
    console.log('Valor de signatureDataInput:', signatureData);
    
    if (!name) {
        showAlert('Por favor ingresa un nombre', 'warning');
        return;
    }
    
    // Verificar si hay una firma guardada o si estamos en modo edición
    if (!signatureData && !isEditing) {
        showAlert('Por favor guarda tu firma primero', 'warning');
        return;
    }
    
    try {
        const url = isEditing 
            ? `/api/signatures/${currentSignatureId}`
            : '/api/signatures';
            
        const method = isEditing ? 'PUT' : 'POST';
        
        // Si estamos editando y no hay una nueva firma, solo actualizamos el nombre
        const requestBody = isEditing && !signatureDataInput.value
            ? { name }
            : { 
                name, 
                signature_data: signatureDataInput.value  // Cambiado a signature_data para coincidir con el backend
              };
        
        console.log('Enviando solicitud a:', url);
        console.log('Método:', method);
        console.log('Datos a enviar:', requestBody);
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error en la respuesta del servidor:', errorData);
            throw new Error(errorData.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la firma`);
        }
        
        const result = await response.json();
        console.log('Respuesta del servidor:', result);
        
        showAlert(
            isEditing 
                ? 'Firma actualizada correctamente' 
                : 'Firma guardada correctamente',
            'success'
        );
        
        // Recargar la lista de firmas
        loadSignatures();
        
        // Limpiar el formulario
        signatureForm.reset();
        signaturePad.clear();
        signatureDataInput.value = '';
        document.querySelector('.signature-preview-container').style.display = 'none';
        
        // Salir del modo edición si estábamos editando
        if (isEditing) {
            cancelEdit();
        }
        
    } catch (error) {
        console.error('Error al guardar la firma:', error);
        showAlert(error.message || 'Error al guardar la firma', 'danger');
    }
}

// Editar firma
function editSignature(id) {
    try {
        const signature = allSignatures.find(s => s.id === id);
        if (!signature) {
            showAlert('No se encontró la firma para editar', 'danger');
            return;
        }
        
        // Configurar para edición
        isEditing = true;
        currentSignatureId = id;
        formTitle.textContent = 'Editar Firma';
        cancelBtn.style.display = 'inline-block';
        
        // Llenar el formulario con los datos de la firma
        document.getElementById('name').value = signature.name || '';
        
        // Si hay una firma existente, mostrarla en la vista previa
        if (signature.signature_image) {
            signaturePreview.src = signature.signature_image;
            signatureDataInput.value = signature.signature_image;
            document.querySelector('.signature-preview-container').style.display = 'block';
            
            // Cargar la firma en el canvas para edición
            const image = new Image();
            image.onload = function() {
                const canvas = signaturePad.canvas;
                const context = canvas.getContext('2d');
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
            };
            image.src = signature.signature_image;
        } else {
            // Limpiar el canvas y la vista previa si no hay firma
            signaturePad.clear();
            signaturePreview.src = '';
            signatureDataInput.value = '';
            document.querySelector('.signature-preview-container').style.display = 'none';
        }
        
        // Desplazarse al formulario
        signatureForm.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error al cargar la firma:', error);
        showAlert('Error al cargar la firma para editar', 'danger');
    }
}

// Ver firma en grande
window.viewSignature = async function(id) {
    try {
        const response = await fetch(`/api/signatures/${id}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar la firma');
        }
        
        const signature = await response.json();
        
        if (signature.signature_image) {
            document.getElementById('modalSignatureImage').src = signature.signature_image;
            viewSignatureModal.show();
        }
    } catch (error) {
        console.error('Error al cargar la firma:', error);
        showAlert('Error al cargar la firma', 'danger');
    }
};

// Eliminar firma
window.deleteSignature = async function(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta firma?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/signatures/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar la firma');
        }
        
        showAlert('Firma eliminada correctamente', 'success');
        loadSignatures();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al eliminar la firma', 'danger');
    }
};

// Cancelar edición
function cancelEdit() {
    isEditing = false;
    currentSignatureId = null;
    signatureForm.reset();
    formTitle.textContent = 'Agregar Nueva Firma';
    cancelBtn.style.display = 'none';
    signaturePreview.classList.add('d-none');
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

// Escapar HTML para prevenir XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
