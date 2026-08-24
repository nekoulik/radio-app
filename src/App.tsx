import { useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, AppRoot } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';

import { RadioPlayer } from './components/RadioPlayer';
import { DEFAULT_VIEW_PANELS } from './routes';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.RADIO } = useActiveVkuiLocation();

  useEffect(() => {
    bridge.send('VKWebAppInit');

    bridge.send('VKWebAppSetViewSettings', {
      status_bar_style: 'light',
      action_bar_behavior: 'none',
    } as any).catch(() => {
      // Игнорируем ошибку
    });
  }, []);

  return (
    <AppRoot>
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