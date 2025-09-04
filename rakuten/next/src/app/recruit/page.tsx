"use client"; // クライアントコンポーネントとして動作させるための指示。useStateなどのReactフックを使うために必要。

// Yamada UIから必要なコンポーネントをインポート
import {
  Button,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Heading,
  Box,
  Text,
  UIProvider,
  Textarea,
  HStack,
} from "@yamada-ui/react";
import { DatePicker } from "@yamada-ui/calendar"; // DatePickerを再度追加
import { useState } from "react"; // ReactのState管理フックをインポート
import Link from "next/link";
import { useRouter } from "next/navigation"; // useRouterをインポート
import { getToken } from "../../utils/auth.ts";

// ヘルパー関数：YYYY-MM-DD形式の文字列をローカルタイムゾーンのDateオブジェクトに変換
const parseDateStringAsLocal = (dateString: string): Date | null => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// ヘルパー関数：DateオブジェクトをYYYY-MM-DD形式の文字列に変換
const formatDateToYYYYMMDD = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// メインのページコンポーネント
export default function Page() {
  const router = useRouter(); // useRouterフックを使用してルーターを取得

  // 各入力フィールドの状態を管理するためのuseStateフック
  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [start_date, setStart_date] = useState<string>("");
  const [end_date, setEnd_date] = useState<string>("");
  const [recruiting_number, setRecruiting_number] = useState<string>(""); // APIスキーマに合わせて変更
  const [phone, setPhone] = useState<string>("");
  const [tools, setTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState<string>("");
  const [accommodation, setAccommodation] = useState<"有" | "無" | "">("");
  const [car, setCar] = useState<"必須" | "あるのが好ましい" | "無" | "">("");
  const [note, setNote] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // エラーメッセージを管理するためのState
  const [titleError, setTitleError] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [startDateError, setStartDateError] = useState<string>("");
  const [endDateError, setEndDateError] = useState<string>("");
  const [recruitingNumberError, setRecruitingNumberError] =
    useState<string>(""); // 変数名を変更
  const [phoneError, setPhoneError] = useState<string>("");
  const [accommodationError, setAccommodationError] = useState<string>("");
  const [carError, setCarError] = useState<string>("");
  const [dateRangeError, setDateRangeError] = useState<string>("");

  // 道具を追加する関数
  const handleAddTool = () => {
    if (newTool.trim() !== "" && !tools.includes(newTool.trim())) {
      setTools([...tools, newTool.trim()]);
      setNewTool("");
    }
  };

  // 道具を削除する関数
  const handleRemoveTool = (toolToRemove: string) => {
    setTools(tools.filter((tool) => tool !== toolToRemove));
  };

  // 「登録」ボタンがクリックされたときの処理
  const handleSubmit = async () => {
    // APIトークンをここで取得
    const token = getToken();
    console.log("取得するトークン:", token);

    if (!token) {
      alert("ログインが必要です。ログインページに移動します。");
      router.push("/login");
      return;
    }

    // エラーメッセージをリセット
    setTitleError("");
    setLocationError("");
    setStartDateError("");
    setEndDateError("");
    setRecruitingNumberError("");
    setPhoneError("");
    setAccommodationError("");
    setCarError("");
    setDateRangeError("");

    let isValid = true;

    // 必須フィールドのバリデーション
    if (title.trim() === "") {
      setTitleError("タイトルは必須です。");
      isValid = false;
    }
    if (location.trim() === "") {
      setLocationError("場所は必須です。");
      isValid = false;
    }
    if (start_date.trim() === "") {
      setStartDateError("開始日は必須です。");
      isValid = false;
    }
    if (end_date.trim() === "") {
      setEndDateError("終了日は必須です。");
      isValid = false;
    }
    if (recruiting_number.trim() === "") {
      setRecruitingNumberError("人数は必須です。");
      isValid = false;
    } else if (parseInt(recruiting_number, 10) <= 0) {
      setRecruitingNumberError("人数は1以上である必要があります。");
      isValid = false;
    }
    if (phone.trim() === "") {
      setPhoneError("電話番号は必須です。");
      isValid = false;
    }
    if (accommodation === "") {
      setAccommodationError("宿の有無は必須です。");
      isValid = false;
    }
    if (car === "") {
      setCarError("車の有無は必須です。");
      isValid = false;
    }

    if (start_date && end_date) {
      const startDateObj = parseDateStringAsLocal(start_date);
      const endDateObj = parseDateStringAsLocal(end_date);
      if (
        startDateObj &&
        endDateObj &&
        endDateObj.getTime() < startDateObj.getTime()
      ) {
        setDateRangeError("終了日は開始日より前の日付にできません。");
        isValid = false;
      }
    }

    if (!isValid) {
      return;
    }

    try {
      let borantia_image_id: number | undefined;
      let imageUrlFromResponse: string | undefined;

      // 1. 画像ファイルが選択されていればアップロード
      if (selectedFile) {
        // multipart/form-data形式でデータを送信
        const imgForm = new FormData();
        imgForm.append("image", selectedFile);

        const imgRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imgForm,
          }
        );

        if (!imgRes.ok) {
          const errorData = await imgRes.json();
          throw new Error(errorData.message || "画像アップロード失敗");
        }

        const imgJson = await imgRes.json();
        borantia_image_id = imgJson.id;
        imageUrlFromResponse = imgJson.url; // 画像のURLを取得（表示用）
      }

      // enum型をAPIのスキーマに合わせて変換
      const accommodationForApi = accommodation === "有"; // '有' -> true, '無' -> false
      const carForApi =
        car === "必須"
          ? "must"
          : car === "あるのが好ましい"
          ? "preferred"
          : "none"; // 日本語 -> 英語

      // 2. ボランティア新規投稿APIを叩く
      const postData = {
        title: title,
        location: location,
        start_date: start_date,
        end_date: end_date,
        recruiting_number: parseInt(recruiting_number, 10),
        phone: phone,
        accommodation: accommodationForApi,
        car: carForApi,
        note: note,
        borantia_image_id: borantia_image_id, // 画像アップロードAPIのレスポンスIDを使用
        tools: tools, // 道具の配列を追加
      };

      console.log("送信するデータ:", postData); // デバッグ用ログ

      const postRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/borantia-contents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!postRes.ok) {
        const errorData = await postRes.json();
        throw new Error(errorData.message || "ボランティア作成失敗");
      }

      const result = await postRes.json();

      // 成功後に/mypageへ遷移
      router.push("/mypage");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <UIProvider>
      <div className="flex min-h-screen items-center justify-center bg-[#FFF2F9] p-4">
        <Box
          p={{ base: "4", sm: "8" }}
          maxWidth="600px"
          mx="auto"
          my="8"
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="lg"
          bg="white"
        >
          {/* 一覧に戻るボタン */}
          <HStack justify="start" w="100%">
            <Link href="/">
              <Button
                bg="white"
                color="black"
                size="md"
                px={6}
                _hover={{
                  bg: "gray.100",
                  transform: "translateY(-2px)",
                }}
                boxShadow="lg"
                borderRadius="lg"
                fontSize="md"
                fontWeight="bold"
              >
                ← 一覧に戻る
              </Button>
            </Link>
          </HStack>
          <Heading as="h1" size="xl" textAlign="center" mb="8" color="gray.700">
            募集の登録
          </Heading>

          <Stack spacing="6">
            <Box>
              <Text mb="1" fontWeight="semibold" color="gray.600">
                タイトル
              </Text>
              <Input
                placeholder="タイトルを入力"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="md"
                isInvalid={!!titleError}
              />
              {titleError && (
                <Text color="red.500" fontSize="sm" mt="1">
                  {titleError}
                </Text>
              )}
            </Box>

            <Box>
              <Text mb="1" fontWeight="semibold" color="gray.600">
                場所
              </Text>
              <Input
                placeholder="場所を入力"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                size="md"
                isInvalid={!!locationError}
              />
              {locationError && (
                <Text color="red.500" fontSize="sm" mt="1">
                  {locationError}
                </Text>
              )}
            </Box>

            <Box>
              <Text mb="1" fontWeight="semibold" color="gray.600">
                期間
              </Text>
              <Stack direction="row" spacing="4" alignItems="center">
                <DatePicker
                  placeholder="開始日"
                  flex="1"
                  value={start_date ? parseDateStringAsLocal(start_date) : null}
                  onChange={(date) => setStart_date(formatDateToYYYYMMDD(date))}
                  size="md"
                  isInvalid={!!startDateError || !!dateRangeError}
                />
                <Box whiteSpace="nowrap" color="gray.600">
                  から
                </Box>
                <DatePicker
                  placeholder="終了日"
                  flex="1"
                  value={end_date ? parseDateStringAsLocal(end_date) : null}
                  onChange={(date) =>
                    setEnd_date(date ? formatDateToYYYYMMDD(date) : "")
                  }
                  size="md"
                  isInvalid={!!endDateError || !!dateRangeError}
                />
                <Box whiteSpace="nowrap" color="gray.600">
                  まで
                </Box>
              </Stack>
              {startDateError && (
                <Text color="red.500" fontSize="sm" mt="1">
                  {startDateError}
                </Text>
              )}
              {endDateError && !startDateError && (
                <Text color="red.500" fontSize="sm" mt="1">
                  {endDateError}
                </Text>
              )}
              {dateRangeError && (
                <Text color="red.500" fontSize="sm" mt="1">
                  {dateRangeError}
                </Text>
              )}
            </Box>

            <Stack direction={{ base: "column", sm: "row" }} spacing="4">
              <Box flex="1">
                <Text mb="1" fontWeight="semibold" color="gray.600">
                  人数
                </Text>
                <Input
                  placeholder="人数を入力"
                  type="number"
                  value={recruiting_number} // 変数名を変更
                  onChange={(e) => setRecruiting_number(e.target.value)} // 変数名を変更
                  size="md"
                  isInvalid={!!recruitingNumberError} // 変数名を変更
                />
                {recruitingNumberError && (
                  <Text color="red.500" fontSize="sm" mt="1">
                    {recruitingNumberError}
                  </Text>
                )}
              </Box>
              <Box flex="1">
                <Text mb="1" fontWeight="semibold" color="gray.600">
                  電話番号
                </Text>
                <Input
                  placeholder="電話番号"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  size="md"
                  isInvalid={!!phoneError}
                />
                {phoneError && (
                  <Text color="red.500" fontSize="sm" mt="1">
                    {phoneError}
                  </Text>
                )}
              </Box>
            </Stack>

            <Box>
              <Text mb="1" fontWeight="semibold" color="gray.600">
                必要な道具
              </Text>
              <Stack direction="row" spacing="2" alignItems="center">
                <Input
                  placeholder="道具を追加"
                  flex="1"
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddTool();
                    }
                  }}
                  size="md"
                />
                <Button
                  onClick={handleAddTool}
                  bg="#6A99FF"
                  color="white"
                  size="md"
                >
                  追加
                </Button>
              </Stack>
              <Stack direction="row" spacing="2" mt="2" flexWrap="wrap">
                {tools.map((tool, index) => (
                  <Box
                    key={index}
                    px="3"
                    py="1"
                    bg="gray.100"
                    borderRadius="full"
                    fontSize="sm"
                    color="gray.700"
                    display="flex"
                    alignItems="center"
                    gap="1"
                  >
                    {tool}
                    <Text
                      as="span"
                      ml="1"
                      cursor="pointer"
                      onClick={() => handleRemoveTool(tool)}
                      fontWeight="bold"
                    >
                      ×
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box>
              <Text mb="1" fontWeight="semibold" color="gray.600">
                宿
              </Text>
              <RadioGroup
                value={accommodation}
                onChange={setAccommodation}
                isInvalid={!!accommodationError}
              >
                <Stack direction="row" spacing="4">
                  <Radio value="有">有</Radio>
                  <Radio value="無">無</Radio>
                </Stack>
              </RadioGroup>
              {accommodationError && (
                <Text color="red.500" fontSize="sm" mt="1">
                  {accommodationError}
                </Text>
              )}
            </Box>

            <Box>
              <Text mb="1" fontWeight="semibold" color="gray.600">
                車
              </Text>
              <RadioGroup value={car} onChange={setCar} isInvalid={!!carError}>
                <Stack direction="row" spacing="4">
                  <Radio value="必須">必須</Radio>
                  <Radio value="あるのが好ましい">あるのが好ましい</Radio>
                  <Radio value="無">無</Radio>
                </Stack>
              </RadioGroup>
              {carError && (
                <Text color="red.500" fontSize="sm" mt="1">
                  {carError}
                </Text>
              )}
            </Box>

            <Box>
              <Text mb="1" fontWeight="semibold" color="gray.600">
                備考
              </Text>
              <Textarea
                placeholder="備考を入力"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                size="md"
                rows={3}
              />
            </Box>

            <Box>
              <Text mb="1" fontWeight="semibold" color="gray.600">
                画像
              </Text>
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                p="2"
                borderWidth="1px"
                borderRadius="md"
              />
            </Box>

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
              onClick={handleSubmit}
            >
              登録
            </Button>
          </Stack>
        </Box>
      </div>
    </UIProvider>
  );
}
