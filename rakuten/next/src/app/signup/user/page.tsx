"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, ButtonGroup, Text } from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { setUserData } from "../../../utils/auth";

export default function SignupUserPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "male",
    birthday: "",
    address: "",
    is_has_car: false,
    note: "",
    role: "user",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setForm({ ...form, [name]: newValue });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    console.log("送信データ:", form);

    try {
      const res = await fetch("/api/register/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("レスポンスデータ:", data);

      if (res.status === 422) {
        console.log("バリデーションエラー:", data.errors);
        setErrors(data.errors || {});
        setGeneralError(data.error || "バリデーションエラーが発生しました");
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || "登録に失敗しました");
      }

      // 登録成功時にトークンとロールを保存（認証状態変更イベントを発火）
      const token = data.access_token;
      const role = data.role;

      if (token && role) {
        setUserData(token, role, data.user?.id);
        console.log("認証情報保存完了:", {
          token,
          role,
          user_id: data.user?.id,
        });
      }

      router.push("/mypage");
    } catch (e) {
      console.error("エラー詳細:", e);
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
          参加者用アカウント登録画面
        </Text>
        <p className="mt-2 text-center text-xl font-semibold text-gray-600">
          ボランティア参加新規登録
        </p>

        <form onSubmit={handleRegister} className="mt-8 space-y-6">
          {/* アカウント情報 */}
          <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-6">
            {[
              ["名前", "name", "text"],
              ["メールアドレス", "email", "email"],
              ["パスワード", "password", "password"],
              ["電話番号", "phone", "text"],
              ["誕生日", "birthday", "date"],
              ["住所", "address", "text"],
            ].map(([label, name, type]) => (
              <div key={name} className="grid grid-cols-3 items-center gap-4">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor={name}
                >
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={(form as any)[name]}
                  onChange={handleChange}
                  className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required={name !== "phone" && name !== "birthday"}
                />
                {errors[name as keyof typeof form] && (
                  <p className="text-red-500 text-sm mb-2">
                    {errors[name as keyof typeof form]}
                  </p>
                )}
              </div>
            ))}

            <div className="grid grid-cols-3 items-center gap-4">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="gender"
              >
                性別
              </label>

              <div className="col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={form.gender === "male"}
                    onChange={handleChange}
                  />
                  男性
                </label>

                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={form.gender === "female"}
                    onChange={handleChange}
                  />
                  女性
                </label>

                {/* 
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={form.gender === "other"}
                  onChange={handleChange}
                />
                その他
              </label>
              */}
              </div>

              {errors.gender && (
                <p className="col-span-3 text-red-500 text-sm mb-2">
                  {errors.gender}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                車を持っています
              </label>
              <div className="col-span-2 flex items-center gap-4">
                <input
                  type="checkbox"
                  name="is_has_car"
                  checked={form.is_has_car}
                  onChange={handleChange}
                  className="mr-2"
                />
              </div>
              {errors.is_has_car && (
                <p className="text-red-500 text-sm mb-2">{errors.is_has_car}</p>
              )}
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="note"
              >
                備考
              </label>
              <textarea
                id="note"
                name="note"
                value={form.note}
                onChange={handleChange}
                className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            {errors.note && (
              <p className="text-red-500 text-sm mb-2">{errors.note}</p>
            )}

            {generalError && (
              <p className="text-red-600 font-semibold mb-4">{generalError}</p>
            )}
          </div>

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
