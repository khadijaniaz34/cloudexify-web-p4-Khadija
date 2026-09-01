// js/auth.js — register, login, logout, role checks

/* ---------- Register ---------- */
/* ---------- Register ---------- */
async function registerUser(fullName, email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) return { error };

    // Create the matching profile row (role defaults to 'customer')
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user.id, full_name: fullName, role: "customer" }]);
      if (profileError) return { error: profileError };
    }

    return { data };
  } catch (err) {
    console.error("registerUser threw:", err);
    return { error: { message: err.message || "Something went wrong. Check the browser console." } };
  }
}

/* ---------- Login ---------- */
/* ---------- Login ---------- */
async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  } catch (err) {
    console.error("loginUser threw:", err);
    return { error: { message: err.message || "Something went wrong. Check the browser console." } };
  }
}

/* ---------- Logout ---------- */
async function logoutUser() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

/* ---------- Session guard for the customer panel ---------- */
async function requireSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

/* ---------- Admin guard — call this first on admin.html ---------- */
async function requireAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", session.user.id)
    .single();

  if (error || !profile || profile.role !== "admin") {
    window.location.href = "index.html";
    return null;
  }

  return { session, profile };
}

/* ---------- Reflect logged-in state in the navbar ---------- */
async function reflectAuthState() {
  const { data: { session } } = await supabase.auth.getSession();
  const authLink = document.getElementById("authLink");
  if (!authLink) return;

  if (session) {
    authLink.textContent = "Log out";
    authLink.href = "#";
    authLink.onclick = (e) => { e.preventDefault(); logoutUser(); };
  } else {
    authLink.textContent = "Log in";
    authLink.href = "login.html";
  }
}
