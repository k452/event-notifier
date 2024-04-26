# コンテナ実行時に環境変数を与える必要がある

FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lockb index.ts ./ 
RUN bun install --frozen-lockfile --production

ENTRYPOINT [ "bun", "run", "index.ts" ]
