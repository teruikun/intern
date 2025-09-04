"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, ButtonGroup, Text } from "@yamada-ui/react";
import { setUserData } from "../../utils/auth";

// テスト:成功したらルートにはいる失敗はアラートを表示
const mockUser = {
  id: 1,
  phone: "080-1234-5678",
  email: "test@example.com",
  password: "password123",
  name: "テストユーザー",
  birthday: "1990-01-01",
  address: "東京都新宿区",
  is_has_car: false,
  note: "テストユーザーのメモ",
};

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("=== ログイン処理開始 ===");
    console.log("送信データ:", form);
    console.log(
      "送信先URL:",
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`
    );
    console.log(
      "NEXT_PUBLIC_API_BASE_URL:",
      process.env.NEXT_PUBLIC_API_BASE_URL
    );

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      console.log("=== レスポンス情報 ===");
      console.log("ステータス:", res.status);
      console.log("ステータステキスト:", res.statusText);
      console.log(
        "レスポンスヘッダー:",
        Object.fromEntries(res.headers.entries())
      );

      // レスポンステキストを先に取得
      const responseText = await res.text();
      console.log("生のレスポンステキスト:", responseText);

      if (!res.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSONパースエラー:", parseError);
          console.error("パースできなかったレスポンス:", responseText);
          throw new Error(
            `ログインに失敗しました (${res.status}): ${responseText}`
          );
        }
        console.log("エラーレスポンス:", errorData);
        throw new Error(errorData.message || "ログインに失敗しました");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("成功レスポンスのJSONパースエラー:", parseError);
        console.error("パースできなかったレスポンス:", responseText);
        throw new Error("サーバーからの応答を解析できませんでした");
      }
      console.log("=== 成功レスポンス詳細 ===");
      console.log("全レスポンスデータ:", data);
      console.log("access_token:", data.access_token);
      console.log("role:", data.role);
      console.log("message:", data.message);
      console.log("user:", data.user);

      const { access_token, role } = data;

      // トークンとロールを保存（認証状態変更イベントを発火）
      if (access_token && role) {
        setUserData(access_token, role, data.user?.id);
        console.log("認証情報保存完了:", {
          access_token,
          role,
          user_id: data.user?.id,
        });
      }

      router.push("/mypage");
    } catch (e) {
      console.error("=== ログインエラー詳細 ===");
      console.error("エラーオブジェクト:", e);
      console.error("エラーメッセージ:", (e as Error).message);
      alert((e as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF2F9] p-4">
      <div className="flex w-full max-w-2xl flex-col items-center rounded-lg bg-white p-8 shadow-md">
        <Text
          fontSize="3xl"
          fontWeight="bold"
          color="black"
          textAlign="center"
          mt={4}
        >
          ログイン
        </Text>

        {/* ログインフォーム */}
        <form onSubmit={handleLogin} className="mt-8 w-full max-w-sm space-y-4">
          <div className="flex w-full flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="test@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="パスワードを入力"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              ログイン種別
            </label>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="organization"
                  checked={form.role === "organization"}
                  onChange={handleChange}
                />
                募集者（団体）
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={form.role === "user"}
                  onChange={handleChange}
                />
                参加者（ユーザー）
              </label>
            </div>
          </div>

          <div className="flex justify-center">
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
              ログイン
            </Button>
          </div>
        </form>

        {/* 新規登録セクション */}
        <div className="mt-12 w-full max-w-sm">
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="black"
            textAlign="center"
            mt={4}
          >
            新規登録
          </Text>

          <div className="mt-4 flex justify-center gap-4">
            <Link href="/signup/group">
              <Button
                colorScheme="pink"
                variant="outline"
                size="lg"
                w="200px"
                _hover={{
                  bg: "#FFDDEE",
                  transform: "translateY(-2px)",
                }}
                boxShadow="lg"
                borderRadius="lg"
                fontSize="sm"
                fontWeight="bold"
              >
                募集企業として登録
              </Button>
            </Link>
            <Link href="/signup/user">
              <Button
                colorScheme="pink"
                variant="outline"
                size="lg"
                w="200px"
                _hover={{
                  bg: "#FFDDEE",
                  transform: "translateY(-2px)",
                }}
                boxShadow="lg"
                borderRadius="lg"
                fontSize="sm"
                fontWeight="bold"
              >
                ボランティアとして登録
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
