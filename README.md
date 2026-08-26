# 🌸 AniWave Radio

**Лучшее аниме-радио ВКонтакте (VK Mini App)**

AniWave Radio — это современное веб-приложение для прослушивания японской музыки, саундтреков из аниме и Lo-Fi битов прямо во ВКонтакте. Приложение написано на **React + TypeScript** с использованием дизайн-системы **VKUI**.

<div align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-NextGen-646CFF?logo=vite" alt="Vite" />
</div>

---

## ✨ Возможности

*    **15+ Радиостанций**: J-Pop, Anime OST, Lo-Fi, City Pop, K-Pop и многое другое.
*    **Умный поиск**: Мгновенная фильтрация станций по названию или жанру.
*   ❤️ **Избранное**: Сохраняйте любимые станции (данные сохраняются в LocalStorage).
*   🌙 **Таймер сна**: Автоматическое выключение через 15, 30 или 60 минут.
*   🎨 **Полноэкранный режим**: Стильный плеер "Сейчас играет" с анимированной визуализацией.
*   📱 **Адаптивность**: Идеально работает на ПК и мобильных устройствах внутри VK.
*   ⚡ **Быстрая работа**: Оптимизировано на Vite для мгновенной загрузки.
*   💬 **Чат с сообществом**: Общайтесь с другими слушателями напрямую.

## 🛠 Технологический стек

| Категория | Технологии |
| :--- | :--- |
| **Core** | React 18, TypeScript |
| **Build Tool** | Vite |
| **UI Kit** | @vkontakte/vkui (VKUI) |
| **Icons** | @vkontakte/icons |
| **State** | React Hooks (`useState`, `useEffect`, `useMemo`) |
| **Storage** | LocalStorage (для избранного) |
| **Audio** | HTML5 Audio API |

## 🚀 Установка и запуск

Чтобы запустить проект локально, выполните следующие шаги:

1.  **Клонируйте репозиторий:**
    ```bash
    git clone https://github.com/nekoulik/radio-app.git
    cd radio-app
    ```

2.  **Установите зависимости:**
    ```bash
    npm install
    # или
    yarn install
    ```

3.  **Запустите сервер разработки:**
    ```bash
    npm run dev
    ```

4.  **Откройте приложение:**
    Перейдите по ссылке [http://localhost:5173](http://localhost:5173) в вашем браузере.

## 📂 Структура проекта

```text
radio-app/
── public/
│   ├── icons/            # Иконки приложения (PWA/Favicon)
│   └── background.png    # Фоновое изображение плеера
├── src/
│   ├── components/       # UI компоненты (Плеер, Поиск, Визуализатор, NowPlaying)
│   ├── data/             # Данные радиостанций (radioStations.ts)
│   ├── hooks/            # Кастомные хуки (useFavorites)
│   ├── App.tsx           # Корневой компонент
│   └── main.tsx          # Точка входа
├── index.html            # Главный HTML файл с мета-тегами
└── vite.config.ts        # Конфигурация сборщика

🤝 Как внести вклад
Pull Request'ы приветствуются! Если у вас есть идеи по улучшению или вы нашли баг, пожалуйста, создайте Issue.
1.Форкните репозиторий.
2.Создайте ветку для вашей фичи (git checkout -b feature/AmazingFeature).
3.Закоммитьте изменения (git commit -m 'Add some AmazingFeature').
Запушьте в ветку (git push origin feature/AmazingFeature).
4.Откройте Pull Request.
📄 Лицензия
Этот проект распространяется под лицензией MIT. Подробнее в файле LICENSE.
Made with ❤️ and ☕ by Nekoulik