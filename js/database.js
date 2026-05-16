// js/database.js
// Simulador de Base de Datos usando localStorage

const defaultDB = {
    users: [
        { email: "admin@kitia.com", password: "123", name: "Administrador", type: "admin", status: "active", unlockedPackages: [] },
        { email: "premium@test.com", password: "123", name: "Usuario Premium", type: "premium", status: "active", unlockedPackages: [] },
        { email: "free@test.com", password: "123", name: "Usuario Gratis", type: "free", status: "active", unlockedPackages: [] }
    ],
    codes: [
        { code: "PREMIUM-123", type: "premium", packageId: null, used: false, usedBy: null },
        { code: "PACK-ABC", type: "package", packageId: "pdf1", used: false, usedBy: null }
    ],
    currentUser: null,
    geminiApiKey: "AIzaSyB7Z4t_MIh414NJvkdFG4PDlv70dfZGsTQ", // <--- PEGA TU API KEY AQUÍ ADENTRO DE LAS COMILLAS
    geminiModel: "gemini-2.5-flash" // <--- CAMBIA EL MODELO AQUÍ SI ES NECESARIO (ej: gemini-pro, gemini-1.5-flash)
};

// Inicializar la DB si no existe (o forzar reinicio cambiando el nombre de la key)
function initDB() {
    if (!localStorage.getItem('kit_ia_db_v5')) {
        localStorage.setItem('kit_ia_db_v5', JSON.stringify(defaultDB));
        console.log("Base de datos inicializada (v5)");
    }
}

function getDB() {
    return JSON.parse(localStorage.getItem('kit_ia_db_v5'));
}

function saveDB(db) {
    localStorage.setItem('kit_ia_db_v5', JSON.stringify(db));
}

// Usuarios
function registerUser(name, email, password) {
    const db = getDB();
    const cleanEmail = email.toLowerCase().trim();
    if (db.users.find(u => u.email.toLowerCase().trim() === cleanEmail)) {
        return false; // Email ya existe
    }
    // Por defecto es free y active
    const newUser = { email: cleanEmail, password, name, type: "free", status: "active", unlockedPackages: [] };
    db.users.push(newUser);
    saveDB(db);
    return newUser;
}

function verifyUser(email, password) {
    const db = getDB();
    const cleanEmail = email.toLowerCase().trim();
    return db.users.find(u => u.email.toLowerCase().trim() === cleanEmail && u.password === password);
}

function updateUserStatus(email, newStatus) {
    const db = getDB();
    const user = db.users.find(u => u.email === email);
    if (user) {
        user.status = newStatus;
        saveDB(db);
    }
}

function deleteUser(email) {
    const db = getDB();
    db.users = db.users.filter(u => u.email !== email);
    saveDB(db);
}

// Códigos (Gift Cards)
function redeemCode(email, codeStr) {
    const db = getDB();
    const codeObj = db.codes.find(c => c.code === codeStr);
    
    if (!codeObj) return { success: false, message: "Código no encontrado" };
    if (codeObj.used) return { success: false, message: "Este código ya ha sido utilizado" };

    const userIndex = db.users.findIndex(u => u.email === email);
    if (userIndex === -1) return { success: false, message: "Usuario no encontrado" };

    // Aplicar beneficio
    if (codeObj.type === 'package') {
        if (!db.users[userIndex].unlockedPackages) db.users[userIndex].unlockedPackages = [];
        if (!db.users[userIndex].unlockedPackages.includes(codeObj.packageId)) {
            db.users[userIndex].unlockedPackages.push(codeObj.packageId);
        }
    } else {
        db.users[userIndex].type = codeObj.type; // Cambia a premium
    }
    codeObj.used = true;
    codeObj.usedBy = email;

    // Actualizar también la sesión actual si es el mismo usuario
    if (db.currentUser && db.currentUser.email === email) {
        if (codeObj.type === 'package') {
            if (!db.currentUser.unlockedPackages) db.currentUser.unlockedPackages = [];
            if (!db.currentUser.unlockedPackages.includes(codeObj.packageId)) {
                db.currentUser.unlockedPackages.push(codeObj.packageId);
            }
        } else {
            db.currentUser.type = codeObj.type;
        }
    }

    saveDB(db);
    return { success: true, newType: codeObj.type };
}

function generateCode(type, packageId = null) {
    const db = getDB();
    const prefix = type === 'package' ? 'PACK' : type.toUpperCase().substring(0,4);
    const random = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}-${random}`;
    
    db.codes.push({ code, type, packageId, used: false, usedBy: null });
    saveDB(db);
    return code;
}

// Sesión
function loginUser(user) {
    const db = getDB();
    db.currentUser = user;
    saveDB(db);
}

function logoutUser() {
    const db = getDB();
    db.currentUser = null;
    saveDB(db);
    window.location.href = "index.html";
}

function getCurrentUser() {
    const db = getDB();
    return db ? db.currentUser : null;
}

function updateApiKey(key, model) {
    const db = getDB();
    db.geminiApiKey = key;
    if (model) db.geminiModel = model;
    saveDB(db);
}

function getApiConfig() {
    const db = getDB();
    return {
        key: db ? db.geminiApiKey : "",
        model: db && db.geminiModel ? db.geminiModel : "gemini-pro"
    };
}

// Ejecutar al cargar
initDB();
