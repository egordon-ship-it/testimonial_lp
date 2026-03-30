(function () {
  var cfg = window.firebaseConfig;
  if (!cfg || !cfg.apiKey || cfg.apiKey.indexOf("REPLACE_") === 0) {
    document.body.innerHTML =
      '<div style="font-family:system-ui;padding:2rem;max-width:40rem;color:#fff;background:#0d1117;min-height:100vh;">' +
      "<h1>Configure Firebase</h1>" +
      "<p>Edit <code>admin/firebase-config.js</code> and set <code>apiKey</code> from Firebase Console (Project settings → Web app).</p>" +
      "</div>";
    return;
  }

  firebase.initializeApp(cfg);
  var auth = firebase.auth();

  var viewLogin = document.getElementById("view-login");
  var viewApp = document.getElementById("view-app");
  var bodyRoot = document.getElementById("body-root");
  var btnGoogle = document.getElementById("btn-google-signin");
  var btnSignout = document.getElementById("btn-signout");
  var tbody = document.getElementById("templates-tbody");
  var btnNew = document.getElementById("btn-new-template");
  var panelList = document.getElementById("panel-list");
  var panelEdit = document.getElementById("panel-edit");
  var btnBack = document.getElementById("btn-back-list");
  var btnPreview = document.getElementById("btn-preview");
  var form = document.getElementById("template-form");
  var fieldSlug = document.getElementById("field-slug");
  var fieldName = document.getElementById("field-name");
  var fieldIntroHeadline = document.getElementById("field-intro-headline");
  var fieldIntroBody = document.getElementById("field-intro-body");
  var fieldGoogleUrl = document.getElementById("field-google-url");
  var fieldThankTitle = document.getElementById("field-thank-title");
  var fieldThankSub = document.getElementById("field-thank-sub");
  var fieldThankHint = document.getElementById("field-thank-hint");
  var btnDelete = document.getElementById("btn-delete");
  var formTitle = document.getElementById("form-title");
  var toastEl = document.getElementById("toast");
  var adminWarning = document.getElementById("admin-warning");

  var editingSlug = null;
  var isNew = false;

  function showToast(msg, isError) {
    toastEl.textContent = msg;
    toastEl.classList.add("visible");
    if (isError) toastEl.classList.add("admin-toast--error");
    else toastEl.classList.remove("admin-toast--error");
    setTimeout(function () {
      toastEl.classList.remove("visible");
    }, 3500);
  }

  function apiUrl(path) {
    return path;
  }

  function fetchAuth(method, path, body) {
    return auth.currentUser.getIdToken().then(function (token) {
      var opts = {
        method: method,
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      };
      if (body != null) opts.body = JSON.stringify(body);
      return fetch(apiUrl(path), opts).then(function (res) {
        if (res.status === 204) return { _empty: true };
        return res.text().then(function (text) {
          var data = {};
          if (text) {
            try {
              data = JSON.parse(text);
            } catch (e) {
              data = { error: text || res.statusText };
            }
          }
          if (!res.ok) {
            var err = new Error(data.error || res.statusText);
            err.status = res.status;
            err.data = data;
            throw err;
          }
          return data;
        });
      });
    });
  }

  function showList() {
    panelList.classList.remove("hidden");
    panelEdit.classList.add("hidden");
    editingSlug = null;
    isNew = false;
  }

  function showEdit() {
    panelList.classList.add("hidden");
    panelEdit.classList.remove("hidden");
  }

  function previewUrlForSlug(slug) {
    var s = (slug || "").trim().toLowerCase();
    if (s === "service") return "/service";
    return "/survey.html?template=" + encodeURIComponent(s);
  }

  function loadTable() {
    tbody.innerHTML = "<tr><td colspan=\"5\">Loading…</td></tr>";
    return fetchAuth("GET", "/api/admin/survey-templates")
      .then(function (data) {
        var rows = data.templates || [];
        if (!rows.length) {
          tbody.innerHTML =
            "<tr><td colspan=\"5\">No templates found. The <strong>service</strong> template should always appear here; refresh or check your connection.</td></tr>";
          return;
        }
        tbody.innerHTML = "";
        rows.forEach(function (t) {
          var tr = document.createElement("tr");
          var updated = t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "—";
          tr.innerHTML =
            "<td>" +
            escapeHtml(t.slug) +
            "</td><td>" +
            escapeHtml(t.name) +
            "</td><td>" +
            escapeHtml(t.googleReviewUrl || "—") +
            "</td><td>" +
            escapeHtml(updated) +
            '</td><td class="admin-table__actions"></td>';
          var actions = tr.querySelector(".admin-table__actions");
          actions.appendChild(actionBtn("Edit", function () {
            openEdit(t.slug);
          }));
          actions.appendChild(actionBtn("Duplicate", function () {
            duplicatePrompt(t.slug, t.name);
          }));
          actions.appendChild(actionBtn("Preview", function () {
            window.open(previewUrlForSlug(t.slug), "_blank", "noopener,noreferrer");
          }));
          actions.appendChild(actionBtn("Delete", function () {
            if (!window.confirm("Delete template “" + t.slug + "”?")) return;
            fetchAuth("DELETE", "/api/admin/survey-templates?slug=" + encodeURIComponent(t.slug))
              .then(function () {
                showToast("Deleted");
                loadTable();
              })
              .catch(function (e) {
                showToast(e.message || "Error", true);
              });
          }));
          tbody.appendChild(tr);
        });
      })
      .catch(function (e) {
        tbody.innerHTML = "<tr><td colspan=\"5\">" + escapeHtml(e.message || "Failed to load") + "</td></tr>";
        if (e.status === 403 || e.message === "Forbidden") {
          adminWarning.textContent =
            "Your Google account is not in ADMIN_EMAIL_ALLOWLIST. Add your email to Cloud Functions config and redeploy.";
          adminWarning.classList.remove("hidden");
        }
      });
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function actionBtn(label, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  function openEdit(slug) {
    editingSlug = slug;
    isNew = false;
    formTitle.textContent = "Edit template";
    fieldSlug.disabled = true;
    btnDelete.classList.remove("hidden");
    btnPreview.disabled = false;
    showEdit();
    return fetchAuth("GET", "/api/admin/survey-templates?slug=" + encodeURIComponent(slug))
      .then(function (t) {
        fieldSlug.value = t.slug || "";
        fieldName.value = t.name || "";
        fieldIntroHeadline.value = t.introHeadline || "";
        fieldIntroBody.value = t.introBody || "";
        fieldGoogleUrl.value = t.googleReviewUrl || "";
        fieldThankTitle.value = t.thankYouTitle || "";
        fieldThankSub.value = t.thankYouSubtitle || "";
        fieldThankHint.value = t.thankYouHint || "";
      })
      .catch(function (e) {
        showToast(e.message || "Load failed", true);
        showList();
      });
  }

  function openNew() {
    editingSlug = null;
    isNew = true;
    formTitle.textContent = "New template";
    fieldSlug.disabled = false;
    btnDelete.classList.add("hidden");
    btnPreview.disabled = true;
    fieldSlug.value = "";
    fieldName.value = "";
    fieldIntroHeadline.value = "";
    fieldIntroBody.value = "";
    fieldGoogleUrl.value = "";
    fieldThankTitle.value = "";
    fieldThankSub.value = "";
    fieldThankHint.value = "";
    showEdit();
  }

  function duplicatePrompt(fromSlug, fromName) {
    var newSlug = window.prompt("New slug (lowercase, hyphens only):", fromSlug + "-copy");
    if (newSlug == null || !String(newSlug).trim()) return;
    var newName = window.prompt("Display name:", (fromName || fromSlug) + " (copy)");
    if (newName == null || !String(newName).trim()) return;
    fetchAuth("POST", "/api/admin/survey-templates", {
      action: "duplicate",
      fromSlug: fromSlug,
      newSlug: newSlug.trim().toLowerCase(),
      newName: newName.trim(),
    })
      .then(function () {
        showToast("Duplicated");
        loadTable();
      })
      .catch(function (e) {
        showToast(e.message || "Duplicate failed", true);
      });
  }

  btnGoogle.addEventListener("click", function () {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(function (e) {
      showToast(e.message || "Sign-in failed", true);
    });
  });

  btnSignout.addEventListener("click", function () {
    auth.signOut();
  });

  btnNew.addEventListener("click", openNew);

  btnBack.addEventListener("click", function () {
    showList();
    loadTable();
  });

  btnPreview.addEventListener("click", function () {
    var s = fieldSlug.value.trim();
    if (s) window.open(previewUrlForSlug(s), "_blank", "noopener,noreferrer");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var body = {
      slug: fieldSlug.value.trim().toLowerCase(),
      name: fieldName.value.trim(),
      introHeadline: fieldIntroHeadline.value.trim(),
      introBody: fieldIntroBody.value.trim(),
      googleReviewUrl: fieldGoogleUrl.value.trim(),
      thankYouTitle: fieldThankTitle.value.trim(),
      thankYouSubtitle: fieldThankSub.value.trim(),
      thankYouHint: fieldThankHint.value.trim(),
    };
    if (isNew) {
      fetchAuth("POST", "/api/admin/survey-templates", body)
        .then(function () {
          showToast("Created");
          showList();
          loadTable();
        })
        .catch(function (err) {
          showToast(err.message || "Save failed", true);
        });
    } else {
      fetchAuth("PUT", "/api/admin/survey-templates", body)
        .then(function () {
          showToast("Saved");
          showList();
          loadTable();
        })
        .catch(function (err) {
          showToast(err.message || "Save failed", true);
        });
    }
  });

  btnDelete.addEventListener("click", function () {
    if (!editingSlug) return;
    if (!window.confirm("Delete “" + editingSlug + "”?")) return;
    fetchAuth("DELETE", "/api/admin/survey-templates?slug=" + encodeURIComponent(editingSlug))
      .then(function () {
        showToast("Deleted");
        showList();
        loadTable();
      })
      .catch(function (e) {
        showToast(e.message || "Delete failed", true);
      });
  });

  auth.onAuthStateChanged(function (user) {
    if (user) {
      viewLogin.classList.add("hidden");
      viewApp.classList.remove("hidden");
      bodyRoot.classList.remove("admin-body--login");
      adminWarning.classList.add("hidden");
      loadTable();
    } else {
      viewLogin.classList.remove("hidden");
      viewApp.classList.add("hidden");
      bodyRoot.classList.add("admin-body--login");
    }
  });
})();
