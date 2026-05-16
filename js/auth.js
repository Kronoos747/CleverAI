// js/auth.js
// Contiene la lógica para proteger las rutas

function requireAuth(allowedTypes) {
    const user = getCurrentUser();
    
    // Si no hay usuario, mandarlo al login
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Verificar si el usuario está inactivo (por falta de pago)
    if (user.status === 'inactive') {
        alert("Tu cuenta ha sido suspendida. Por favor, contacta con soporte para renovar tu acceso.");
        logoutUser();
        return;
    }

    // Verificar si el tipo de usuario está permitido en esta página
    if (allowedTypes && !allowedTypes.includes(user.type)) {
        // Redirigir según el tipo de usuario si intenta entrar a donde no debe
        if (user.type === 'admin') window.location.href = "admin.html";
        else if (user.type === 'onetime') window.location.href = "downloads.html";
        // Si es free y trató de entrar a algo premium
        else if (user.type === 'free' && !allowedTypes.includes('free')) {
            alert("Necesitas ser Premium para acceder a esta sección.");
            window.location.href = "dashboard.html"; // Dashboard maneja la vista free
        }
        else window.location.href = "index.html";
    }
}

// Función para actualizar la interfaz según el usuario logueado
function updateNavbar() {
    const user = getCurrentUser();
    const userDisplay = document.getElementById('user-display');
    const logoutBtn = document.getElementById('logout-btn');

    if (user && userDisplay) {
        userDisplay.textContent = `Hola, ${user.name} (${user.type.toUpperCase()})`;
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
}

// Ejecutar al cargar el DOM si hay navbar
document.addEventListener('DOMContentLoaded', updateNavbar);
