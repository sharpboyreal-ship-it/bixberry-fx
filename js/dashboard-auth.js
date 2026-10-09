import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

let supabase = null;
let currentUser = null;

const configured =
  typeof SUPABASE_URL === "string" &&
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("YOUR_SUPABASE") &&
  typeof SUPABASE_ANON_KEY === "string" &&
  SUPABASE_ANON_KEY.length > 20 &&
  !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");

async function initializeDashboard() {
  // Everyone can use the dashboard without signing in.
  if (configured) {
    try {
      const { createClient } = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
      );

      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data, error } = await supabase.auth.getSession();

      if (!error && data.session) {
        currentUser = data.session.user;
      }
    } catch (error) {
      console.warn("Authentication unavailable; continuing in guest mode.");
    }
  }

  showAccountStatus();
  showMemberFeatures();
}

function showAccountStatus() {
  const header = document.querySelector("header");
  if (!header) return;

  const oldArea = document.getElementById("bixberry-account-area");
  if (oldArea) oldArea.remove();

  const area = document.createElement("div");
  area.id = "bixberry-account-area";
  area.style.cssText =
    "display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-left:auto";

  const status = document.createElement("span");
  status.style.cssText = "color:#c5b2ff;font-size:13px;overflow-wrap:anywhere";

  const action = document.createElement("a");
  action.style.cssText =
    "display:inline-block;padding:10px 14px;border-radius:8px;background:#8a63ed;color:white;text-decoration:none;font-size:13px";

  if (currentUser) {
    status.textContent = currentUser.email || "Signed in";
    action.textContent = "Sign out";
    action.href = "#";

    action.addEventListener("click", async (event) => {
      event.preventDefault();

      if (!supabase) return;

      const { error } = await supabase.auth.signOut();

      if (error) {
        alert("Could not sign out. Please try again.");
        return;
      }

      window.location.reload();
    });
  } else {
    status.textContent = "Guest mode";
    action.textContent = "Sign in";
    action.href = "login.html";
  }

  area.append(status, action);
  header.appendChild(area);
}

function showMemberFeatures() {
  const main = document.querySelector("main");
  if (!main) return;

  const panel = document.createElement("section");
  panel.id = "bixberry-member-panel";
  panel.style.cssText =
    "margin:24px 0;padding:24px;border:1px solid #7154d8;border-radius:16px;background:#15152a;color:#f5f5ff";

  if (currentUser) {
    panel.innerHTML = `
      <p style="color:#a88bff;font-weight:bold;letter-spacing:2px">
        MEMBER AREA
      </p>
      <h2>Welcome to BIXBERRY FX!</h2>
      <p style="color:#b9b7cd;line-height:1.7">
        You're signed in. Your member area is unlocked.
        You can continue exploring the available tools and learning resources.
      </p>
      <a href="markets.html" style="color:#c5b2ff">Explore markets →</a>
    `;
  } else {
    panel.innerHTML = `
      <p style="color:#a88bff;font-weight:bold;letter-spacing:2px">
        GUEST ACCESS
      </p>
      <h2>Explore BIXBERRY FX freely.</h2>
      <p style="color:#b9b7cd;line-height:1.7">
        You don't need an account to explore our markets, learn Forex,
        or practise with demo tools. Create an account when you're ready
        to access member features.
      </p>
      <a href="login.html" style="display:inline-block;padding:12px 18px;background:#8a63ed;color:white;text-decoration:none;border-radius:8px">
        Create an account
      </a>
    `;
  }

  main.prepend(panel);
}

initializeDashboard();
