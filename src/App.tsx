import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, AppRoot } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';

import { RadioPlayer } from './components/RadioPlayer';
import { LoadingScreen } from './components/LoadingScreen'; // <-- Новый импорт
import { DEFAULT_VIEW_PANELS } from './routes';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.RADIO } = useActiveVkuiLocation();

  // Добавляем состояние загрузки
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bridge.send('VKWebAppInit');

    bridge.send('VKWebAppSetViewSettings', {
      status_bar_style: 'light',
      action_bar_behavior: 'none',
    } as any).catch(() => {
      // Игнорируем ошибку
    });

    // Имитируем время загрузки, чтобы пользователь увидел анимацию сакуры
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2000 мс = 2 секунды

    return () => clearTimeout(timer);
  }, []);

  return (
    <AppRoot>
      {/* Загрузочный экран отображается поверх всего */}
      <LoadingScreen isLoading={isLoading} />

      <SplitLayout popout={null}>
        <SplitCol>
          <View activePanel={activePanel}>
            <RadioPlayer id="radio" />
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>
  );
};