
// Sélection des éléments
const form = document.querySelector('#registrationForm');
const btn = document.querySelector('#submitBtn');
const inputs = document.querySelectorAll('input');
const messageRetour = document.querySelector('#message-serveur'); 


// Configuration des validations
const validations = {
    lastname: (val) => val.trim() !== "",
    firstname: (val) => val.trim() !== "",
    useremail: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    username: (val) => /^[a-zA-Z0-9]{6,}$/.test(val), // Alphanumérique minimum 6
    userpwd: (val) => {
        /**
          EXPLICATION DE LA REGEX UNIQUE :
          ^(?=.*[a-z]) : Au moins une minuscule
          (?=.*[A-Z])  : Au moins une majuscule
          (?=.*\d)     : Au moins un chiffre
          (?=.*[_\-;:!?./*&$]) : Au moins un caractère spécial de la liste
          .{12,}       : Minimum 12 caractères au total
         */
        const regexPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_\-;:!?./*&$]).{12,}$/;
        return regexPwd.test(val);
    },
    birthdate: (val) => {
        if (!val) return true; // Optionnel
        const birth = new Date(val);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age >= 18;
    }
};
// Messages d'erreur
const messages = {
    lastname: "Le nom est requis.",
    firstname: "Le prénom est requis.",
    useremail: "Format email invalide.",
    username: "Login : minimum 6 caractères alphanumériques.",
    userpwd: "MDP : minimum 12 caractères, 1 Majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.",
    birthdate: "Vous devez avoir au moins 18 ans."
};

// Fonction de validation 
function validateInput(input) {
    const field = input.id;
    const isValid = validations[field](input.value);
    const errorSpan = input.nextElementSibling;

    if (isValid) {
        input.classList.add('valide');
        input.classList.remove('invalide');
        errorSpan.textContent = "";
    } else {
        input.classList.add('invalide');
        input.classList.remove('valide');
        errorSpan.textContent = messages[field];
    }
    checkFormValidity();
}

// Activation/Désactivation du bouton
function checkFormValidity() {
    const allValid = Array.from(inputs).every(input => {
        if (input.id === 'birthdate' && !input.value) return true;
        return input.classList.contains('valide');
    }
    );
    btn.disabled = !allValid;
}

// Écouteurs d'événements 
inputs.forEach(input => {
    input.addEventListener('input', () => validateInput(input));
});

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // On empêche le rechargement !

    // 1. Ergonomie : On bloque le bouton
    const btn = document.querySelector('#submitBtn');
    const texteOrigine = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Enregistrement en cours...";

    // 2. Préparation des données
    const data = new FormData(form);

    // 3. Envoi avec protection (try...catch)
    try {
        const response = await fetch('htbin/register.py', {
            method: 'POST',
            body: data
        });

        const texte = await response.text(); // On lit la réponse du serveur

        if (texte.startsWith("Erreur :")) {
            // ÉCHEC : On affiche l'erreur
            messageRetour.textContent = texte;
            messageRetour.style.color = "red";
            btn.disabled = false;
            btn.textContent = texteOrigine;
        } else {
            // SUCCÈS : On cache tout
            form.style.display = 'none';
            messageRetour.textContent = texte;
            messageRetour.style.color = "green";
        }

    } catch (error) {
        // ERREUR RÉSEAU (Serveur éteint)
        messageRetour.textContent = "Erreur réseau : Impossible de joindre le serveur.";
        messageRetour.style.color = "red";
        btn.disabled = false;
        btn.textContent = texteOrigine;
    }
}); 