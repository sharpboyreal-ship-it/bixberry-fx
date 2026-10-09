const featureMessage = document.getElementById("feature-message");

function showFeatureMessage(message) {
    if (featureMessage) {
        featureMessage.textContent = message;
    }
}

// Demo interface only: this does not create a secure account.
const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        showFeatureMessage(
            "Registration interface works. Secure account creation requires a backend."
        );
    });
}

const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        showFeatureMessage(
            "Login interface works. Connect secure authentication before using real accounts."
        );
    });
}

// Reference exchange rates from the Frankfurter API.
// These are reference rates, not real-time trading quotes.
async function loadReferenceRates() {
    const table = document.getElementById("market-data");

    if (!table) return;

    table.innerHTML =
        '<tr><td colspan="3">Loading reference rates...</td></tr>';

    try {
        const response = await fetch(
            "https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP,JPY,AUD,KES"
        );

        if (!response.ok) {
            throw new Error("Market data request failed");
        }

        const data = await response.json();

        const rows = Object.entries(data.rates).map(([currency, rate]) => `
            <tr>
                <td>USD/${currency}</td>
                <td>${Number(rate).toFixed(4)}</td>
                <td>Reference rate</td>
            </tr>
        `).join("");

        table.innerHTML = rows;

        const updated = document.getElementById("market-updated");

        if (updated) {
            updated.textContent =
                "Reference date: " + data.date +
                ". These rates are not live trading quotes.";
        }
    } catch (error) {
        table.innerHTML =
            '<tr><td colspan="3">Could not load rates. Check your internet connection.</td></tr>';
    }
}

loadReferenceRates();
