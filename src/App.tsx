import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  View,
  SplitLayout,
  SplitCol,
  AppRoot,
  ConfigProvider,
  AdaptivityProvider
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css'; // Обязательно подключаем стили VKUI

import { RadioPlayer } from './components/RadioPlayer';

export const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Инициализируем VK Bridge один раз при старте
    bridge.send('VKWebAppInit')
      .catch((err) => {
        console.warn('VK Bridge не инициализирован (возможно, открыто вне VK):', err);
      })
      .finally(() => {
        // Показываем приложение в любом случае, даже если инициализация не удалась
        setIsReady(true);
      });
  }, []);

  // Экран загрузки пока приложение не готово
  if (!isReady) {
    return (
      <AppRoot>
        <SplitLayout>
          <SplitCol>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a1a', color: '#fff' }}>
              Загрузка AniWave Radio...
            </div>
          </SplitCol>
        </SplitLayout>
      </AppRoot>
    );
  }

  return (
    <ConfigProvider>
      <AdaptivityProvider>
        {/* mode="full" КРИТИЧЕСКИ ВАЖЕН для VK Mini Apps в VKUI 6+ */}
        <AppRoot mode="full">
          <SplitLayout>
            <SplitCol>
              <View activePanel="radio">
                <RadioPlayer id="radio" />
              </View>
            </SplitCol>
          </SplitLayout>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};