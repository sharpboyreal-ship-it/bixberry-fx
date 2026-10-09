import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const form = document.getElementById("auth-form");
const message = document.getElementById("message");
const submitButton = document.getElementById("submit-button");

const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");

const nameField = document.getElementById("name-field");
const confirmField = document.getElementById("confirm-field");
const fullName = document.getElementById("full-name");
const confirmPassword = document.getElementById("confirm-password");
const passwordInput = document.getElementById("password");

let mode = "login";
let supabase = null;

function setMessage(text, success = false) {
  message.textContent = text;
  message.style.color = success ? "#a7f3c0" : "#ffc2a8";
}

function setMode(newMode) {
  mode = newMode;

  const registering = mode === "register";

  // Update the selected tab.
  loginTab.classList.toggle("active", !registering);
  registerTab.classList.toggle("active", registering);

  // Show or hide registration fields.
  nameField.classList.toggle("hidden", !registering);
  confirmField.classList.toggle("hidden", !registering);

  // Update headings and button labels.
  document.getElementById("form-title").textContent =
    registering ? "Create your account" : "Welcome back";

  document.getElementById("form-description").textContent =
    registering
      ? "Register to get started."
      : "Sign in to your account to continue.";

  submitButton.textContent =
    registering ? "Create account" : "Sign in";

  // Set the correct required fields.
  fullName.required = registering;
  confirmPassword.required = registering;

  passwordInput.autocomplete =
    registering ? "new-password" : "current-password";

  setMessage("");
}

loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));

function getSupabase() {
  if (!SUPABASE_URL.startsWith("https://") ||
      SUPABASE_URL.includes("YOUR_SUPABASE") ||
      !SUPABASE_ANON_KEY ||
      SUPABASE_ANON_KEY.includes("YOUR_SUPABASE")) {
    throw new Error(
      "Supabase is not configured. Check js/supabase-config.js."
    );
  }

  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabase;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value;

  if (password.length < 8) {
    setMessage("Your password must contain at least 8 characters.");
    return;
  }

  if (mode === "register" &&
      password !== confirmPassword.value) {
    setMessage("Your passwords do not match.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Please wait...";
  setMessage("");

  try {
    const client = getSupabase();

    if (mode === "register") {
      const name = fullName.value.trim();

      if (!name) {
        throw new Error("Please enter your full name.");
      }

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        setMessage("Account created! Opening your dashboard...", true);
        window.location.replace("dashboard.html");
      } else {
        setMessage(
          "Registration submitted! Check your email for a confirmation link, then sign in.",
          true
        );
      }
    } else {
      const { error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setMessage("Signed in! Opening your dashboard...", true);
      window.location.replace("dashboard.html");
    }
  } catch (error) {
    setMessage(
      error.message || "Something went wrong. Please try again."
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent =
      mode === "register" ? "Create account" : "Sign in";
  }
});

// Start in sign-in mode.
setMode("login");
