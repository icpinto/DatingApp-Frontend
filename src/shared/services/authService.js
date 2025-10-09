import api from "./api";

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  window.dispatchEvent(
    new CustomEvent("auth-token-changed", { detail: { token: null } })
  );
};

const emitSignOutFeedback = (status) => {
  window.dispatchEvent(
    new CustomEvent("app-sign-out-feedback", { detail: { status } })
  );
};

export async function signOutUser() {
  const token = localStorage.getItem("token");

  if (!token) {
    clearSession();
    emitSignOutFeedback("no_token");
    return { status: "no_token" };
  }

  try {
    await api.post(
      "/signout",
      {},
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );
    clearSession();
    emitSignOutFeedback("success");
    return { status: "success" };
  } catch (error) {
    clearSession();
    emitSignOutFeedback("error");
    return { status: "error", error };
  }
}
