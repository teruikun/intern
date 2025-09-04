// クッキーからトークンとロール情報を取得するユーティリティ関数

export function getUserId(): number | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const idCookie = cookies.find((cookie) => cookie.trim().startsWith("id="));

  if (idCookie) {
    return Number(idCookie.split("=")[1]);
  }

  return null;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("token=")
  );

  if (tokenCookie) {
    return tokenCookie.split("=")[1];
  }

  return null;
}

export function getRole(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const roleCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("role=")
  );

  if (roleCookie) {
    return roleCookie.split("=")[1];
  }

  return null;
}

export function getUserData(): { token: string | null; role: string | null } {
  return {
    token: getToken(),
    role: getRole(),
  };
}

export function clearUserData(): void {
  if (typeof document === "undefined") return;

  // クッキーを削除（過去の日付に設定）
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  // 認証状態変更イベントを発火
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("authStateChanged"));
  }
}

export function setUserData(token: string, role: string, id?: number): void {
  if (typeof document === "undefined") return;

  // クッキーに保存（30日間）
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}`;
  document.cookie = `role=${role}; path=/; expires=${expires.toUTCString()}`;
  if (id) {
    document.cookie = `id=${id}; path=/; expires=${expires.toUTCString()}`;
  }

  // 認証状態変更イベントを発火
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("authStateChanged"));
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  return token !== null && token !== "";
}

export function isOrganization(): boolean {
  const role = getRole();
  return role === "organization";
}

export function isUser(): boolean {
  const role = getRole();
  return role === "user";
}
