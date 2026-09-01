# Legal Leadgen

Технический фундамент сайта для лидогенерации в юридической нише.

## Стек

Next.js, React, TypeScript, App Router, npm и обычный CSS.

## Запуск

```bash
npm install
npm run dev
```

Production-проверка:

```bash
npm run lint
npm run typecheck
npm run build
```

## Основная структура

```text
app/                 маршруты и общие стили
components/          UI, layout, будущие блоки главной и квиза
config/              конфигурации сайта и будущего квиза
lib/analytics/       единая отправка аналитических событий
lib/attribution/     чтение и хранение рекламной атрибуции
types/               общие TypeScript-типы
```

Маршрут `/quiz` зарезервирован под будущую интерактивную воронку. Вопросы будут храниться в `config/quiz.ts`, компоненты — в `components/quiz/`, а типы — в `types/quiz.ts`.

Аналитика располагается в `lib/analytics/`; работа с UTM и другими рекламными параметрами — в `lib/attribution/`.
