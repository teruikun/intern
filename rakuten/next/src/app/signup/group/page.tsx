"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Text } from "@yamada-ui/react";
import { setUserData } from "../../../utils/auth";
export default function SignupGroupPage() {
  const router = useRouter();
  // 一括フォーム管理
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    name: "",
    address: "",
    note: "",
    role: "organization",
  });
  // バリデーションエラー用
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});
  // その他エラー
  const [generalError, setGeneralError] = useState<string | null>(null);
  // 入力変更時
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  // 登録処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    console.log("=== 団体登録処理開始 ===");
    console.log("送信データ:", form);

    try {
      const res = await fetch("/api/register/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      console.log("=== レスポンス情報 ===");
      console.log("ステータス:", res.status);
      console.log("ステータステキスト:", res.statusText);

      const data = await res.json();
      console.log("レスポンスデータ:", data);

      if (res.status === 422) {
        console.log("=== バリデーションエラー詳細 ===");
        console.log("エラー詳細:", data.errors);
        console.log("エラーメッセージ:", data.error);
        setErrors(data.errors || {});
        setGeneralError(data.error || "バリデーションエラーが発生しました");
        return;
      }
      if (!res.ok) {
        throw new Error(data.message || data.error || "登録に失敗しました");
      }

      // 登録成功時にトークンとロールを保存
      console.log("=== 登録成功 ===");
      const token = data.access_token;
      const role = data.role;

      console.log("受信したトークン:", token);
      console.log("受信したロール:", role);

      if (token && role) {
        setUserData(token, role, data.user?.id);
        console.log("認証情報保存完了:", {
          token,
          role,
          user_id: data.user?.id,
        });
      }

      // 登録後、マイページへリダイレクト
      router.push("/mypage");
    } catch (e) {
      console.error("=== 団体登録エラー詳細 ===");
      console.error("エラーオブジェクト:", e);
      console.error("エラーメッセージ:", (e as Error).message);
      setGeneralError((e as Error).message);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF2F9] p-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-8 shadow-md">
        <Text
          fontSize="3xl"
          fontWeight="bold"
          color="black"
          textAlign="center"
          mt={4}
        >
          団体用アカウント登録画面
        </Text>
        <p className="mt-2 text-center text-xl font-semibold text-gray-600">
          ボランティア募集団体新規登録
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* アカウント情報 */}
          <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-6">
            {[
              ["メールアドレス", "email", "email"],
              ["電話番号", "phone", "tel"],
              ["パスワード", "password", "password"],
            ].map(([label, name, type]) => (
              <div className="grid grid-cols-3 items-center gap-4" key={name}>
                <label
                  htmlFor={name}
                  className="text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
                <input
                  type={type}
                  id={name}
                  name={name}
                  value={(form as any)[name]}
                  onChange={handleChange}
                  required
                  className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors[name as keyof typeof form] && (
                  <p className="col-span-3 text-red-500 text-sm mb-2">
                    {errors[name as keyof typeof form]}
                  </p>
                )}
              </div>
            ))}
          </div>
          {/* 団体情報 */}
          <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-6">
            <div className="grid grid-cols-3 items-center gap-4">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                団体名
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="col-span-3 text-red-500 text-sm mb-2">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label
                htmlFor="address"
                className="text-sm font-medium text-gray-700"
              >
                住所
              </label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.address && (
                <p className="col-span-3 text-red-500 text-sm mb-2">
                  {errors.address}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label
                htmlFor="note"
                className="text-sm font-medium text-gray-700"
              >
                備考欄
              </label>
              <textarea
                id="note"
                name="note"
                value={form.note}
                onChange={handleChange}
                rows={3}
                className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.note && (
                <p className="col-span-3 text-red-500 text-sm mb-2">
                  {errors.note}
                </p>
              )}
            </div>
          </div>
          {generalError && (
            <p className="text-red-600 font-semibold mb-2 text-center">
              {generalError}
            </p>
          )}
          <div className="flex justify-end">
            <Button
              type="submit"
              bg="#FFDDEE"
              color="black"
              size="lg"
              px={8}
              _hover={{
                bg: "#FF9999",
                transform: "translateY(-2px)",
              }}
              boxShadow="lg"
              borderRadius="lg"
              fontSize="md"
              fontWeight="bold"
            >
              登録
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <Button
            colorScheme="pink"
            variant="outline"
            size="lg"
            px={8}
            _hover={{
              bg: "#FFDDEE",
              transform: "translateY(-2px)",
            }}
            boxShadow="lg"
            borderRadius="lg"
            fontSize="md"
            fontWeight="bold"
          >
            <Link href="/login" className="font-medium ">
              ログイン画面へ戻る
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
