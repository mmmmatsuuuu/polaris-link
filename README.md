# Polaris Link
生徒が自分のペースで学びを進められることを目指した、情報科向けの学習支援プラットフォームです。

## 起動

```bash
docker compose up
```

**firebaseコンテナ**
```bash
$ docker compose exec firebase bash
$ firebase emulators:start --import=./data --export-on-exit=./data # データの永続化
```

**next.jsコンテナ**
```bash
$ docker compose exec web bash
$ num run dev
```