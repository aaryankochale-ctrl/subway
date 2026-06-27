let isLoginMode = true;

const authContainer = document.getElementById('auth-container');
const authTitle = document.getElementById('auth-title');
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authSubmit = document.getElementById('auth-submit');
const toggleMode = document.getElementById('toggle-mode');
const toggleMessage = document.getElementById('toggle-message');
const authError = document.getElementById('auth-error');

toggleMode.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    // Clear fields
    usernameInput.value = '';
    passwordInput.value = '';
    authError.style.display = 'none';
    
    if (isLoginMode) {
        authTitle.innerText = "Login";
        authSubmit.innerText = "Login";
        toggleMessage.innerText = "Don't have an account?";
        toggleMode.innerText = "Sign Up";
    } else {
        authTitle.innerText = "Sign Up";
        authSubmit.innerText = "Sign Up";
        toggleMessage.innerText = "Already have an account?";
        toggleMode.innerText = "Login";
    }
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        showError("Please fill in all fields.");
        return;
    }
    
    // Get existing users from localStorage
    const users = JSON.parse(localStorage.getItem('game_users')) || {};
    
    if (isLoginMode) {
        // Handle Login
        if (users[username] && users[username] === password) {
            // Success
            startAuthenticatedGame();
        } else {
            showError("Invalid username or password.");
        }
    } else {
        // Handle Signup
        if (users[username]) {
            showError("Username already exists.");
        } else {
            // Create user
            users[username] = password;
            localStorage.setItem('game_users', JSON.stringify(users));
            // Automatically log in
            startAuthenticatedGame();
        }
    }
});

function showError(msg) {
    authError.innerText = msg;
    authError.style.display = 'block';
}

function startAuthenticatedGame() {
    authContainer.style.display = 'none';
    const menuContainer = document.getElementById('menu-container');
    menuContainer.style.display = 'flex';
    
    if (typeof window.updateHighScoresMenu === 'function') {
        window.updateHighScoresMenu();
    }
}
