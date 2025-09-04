FROM php:8.4-fpm-bullseye

# composerベースイメージからバイナリをコピー(マルチステージビルド)
COPY --from=composer:2.2 /usr/bin/composer /usr/bin/composer

#ライブラリのインストール等
RUN apt-get update && \
    apt-get -y install --no-install-recommends git unzip libzip-dev libicu-dev libonig-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    docker-php-ext-install intl pdo_mysql zip bcmath && \
    groupadd gphp && \
    useradd php -g gphp

#デフォルト命令を実行するユーザをrootからphpに変更
USER php

#作業ディレクトリを設定
#ホストOSの/srcの中身をコピー&所有者設定
WORKDIR /var/www/html
COPY --chown=php:gphp ./src /var/www/html/

#storage,bootstrap/cacheはwebサーバがアクセスするためパーミッションを変更
RUN chmod -R 755 storage bootstrap/cache