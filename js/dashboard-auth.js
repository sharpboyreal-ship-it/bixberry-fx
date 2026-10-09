document.addEventListener("DOMContentLoaded", () => {
  // BIXBERRY FX is currently available in guest mode.
  // No sign-in or account is required to use the demo website.

  document.querySelectorAll('a[href="login.html"]').forEach(link => {
    link.remove();
  });

  document.querySelectorAll("[data-auth-required]").forEach(element => {
    element.hidden = true;
  });

  console.log("BIXBERRY FX is running in guest mode.");
});
