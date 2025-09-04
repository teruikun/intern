"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, ButtonGroup, Text } from "@yamada-ui/react";
import mockData from "../mock.json";
import {
  getToken,
  getRole,
  getUserData,
  clearUserData,
  isAuthenticated,
  isOrganization,
  isUser,
} from "../../../utils/auth";

export default function EditMyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [address, setAddress] = useState("");
  const [is_has_car, setIs_has_car] = useState(false);
  const [note, setNote] = useState("");

  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");

  const updateUserMyPage = async (
    userData: any,
    token: string,
    userRole: string
  ) => {
    try {
      const endpoint =
        userRole === "organization"
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/organizations/me`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`プロフィール更新エラー：${response.status}`);
      }

      const data = await response.json();
      console.log("更新成功:", data);
      return data;
    } catch (error) {
      console.error("プロフィール更新エラー:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("=== プロフィール更新開始 ===");
      const userData =
        role === "organization"
          ? {
              name,
              email,
              phone,
              address,
              note,
            }
          : {
              name,
              email,
              phone,
              gender,
              birthday,
              address,
              is_has_car,
              note,
            };

      await updateUserMyPage(userData, token, role);
      alert("プロフィールを更新しました");
      router.push("/mypage");
    } catch (error) {
      alert("更新に失敗しました");
    }
  };

  const fetchUser = async (token) => {
    try {
      console.log("ユーザー取得開始");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`ユーザー取得エラー：${response.status}`);
      }

      const data = await response.json();

      console.log("ユーザー情報");
      console.log("API Response:", data);

      if (data.error) {
        console.error("ユーザー取得エラー：", data.error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("ユーザー取得エラー：", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const currentToken = getToken();
      const currentRole = getRole();

      setToken(currentToken);
      setRole(currentRole);

      console.log("取得したトークンとロール:", currentToken, currentRole);

      if (currentToken) {
        try {
          const fetchedUser = await fetchUser(currentToken);
          setProfile(fetchedUser);
          console.log("取得したプロファイル:", fetchedUser);
        } catch (error) {
          console.error("プロファイル取得エラー:", error);
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (profile) {
      if (profile?.email !== undefined) {
        setEmail(profile.email);
      }
      if (profile?.phone !== undefined) {
        setPhone(profile.phone);
      }
      // if (profile?.password !== undefined) {
      //   setPassword(profile.password);
      // }
      if (profile?.name !== undefined) {
        setName(profile.name);
      }
      if (profile?.gender !== undefined) {
        setGender(profile.gender);
      }
      if (profile?.birthday !== undefined) {
        setBirthday(profile.birthday);
      }
      if (profile?.address !== undefined) {
        setAddress(profile.address);
      }
      if (profile?.is_has_car !== undefined) {
        setIs_has_car(profile.is_has_car);
      }
      if (profile?.note !== undefined) {
        setNote(profile.note);
      }
    }
  }, [profile]);

  return (
    <>
      {role === "organization" ? (
        <div className="flex min-h-screen items-center justify-center bg-[#FFF2F9] p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-8 shadow-md">
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="black"
              textAlign="center"
              mt={4}
            >
              団体用アカウント編集画面
            </Text>
            <p className="mt-2 text-center text-xl font-semibold text-gray-600">
              ボランティア募集団体編集
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* アカウント情報 */}
              <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-6">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
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
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
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
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
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
                  更新
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
                <Link href={`/mypage`} className="font-medium ">
                  ログイン画面へ戻る
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-[#FFF2F9] p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-8 shadow-md">
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="black"
              textAlign="center"
              mt={4}
            >
              参加者用アカウント編集画面
            </Text>
            <p className="mt-2 text-center text-xl font-semibold text-gray-600">
              ボランティア参加者編集
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* アカウント情報 */}
              <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-6">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* ユーザー情報 */}
              <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-6">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    名前
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    性別
                  </label>
                  <div className="col-span-2 flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={gender === "male"}
                        onChange={(e) => setGender(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">男</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={gender === "female"}
                        onChange={(e) => setGender(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">女</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label
                    htmlFor="birthday"
                    className="text-sm font-medium text-gray-700"
                  >
                    生年月日
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    required
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
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
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    車
                  </label>
                  <div className="col-span-2 flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_has_car"
                        value="yes"
                        checked={is_has_car === true}
                        onChange={(e) =>
                          setIs_has_car(e.target.value === "yes")
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">有</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_has_car"
                        value="no"
                        checked={is_has_car === false}
                        onChange={(e) =>
                          setIs_has_car(e.target.value === "yes")
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">無</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label
                    htmlFor="note"
                    className="text-sm font-medium text-gray-700"
                  >
                    一言コメント
                    <br />
                    /備考欄
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
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
                  更新
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
                <Link href={`/mypage`} className="font-medium ">
                  マイページに戻る
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
