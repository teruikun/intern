// next/src/app/(auth)/auth/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  // ユーザー情報を取得して確認
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user data");
    }

    const user = await res.json();

    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">認証済みページ</h1>
        <p>ようこそ、{user.name}さん！</p>

        <form action="/auth/logout" method="POST">
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            ログアウト
          </button>
        </form>
      </div>
    );
  } catch (e) {
    console.error("認証失敗:", (e as Error).message);
    redirect("/login");
  }
}
