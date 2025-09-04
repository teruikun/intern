import { Button } from "@yamada-ui/react";

export default function Page() {
  return (
    <div>
      <h1>Hello World aaaa - ホットリロードテストです</h1>
      <p>
        ホットリロードがうまく動いていますか？ -{" "}
        {new Date().toLocaleTimeString()}
      </p>
      <Button colorScheme="primary" variant="solid">
        Click Me
      </Button>
    </div>
  );
}
