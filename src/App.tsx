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
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';

import { RadioPlayer } from './components/RadioPlayer';
import { LoadingScreen } from './components/LoadingScreen';
import { DEFAULT_VIEW_PANELS } from './routes';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.RADIO } = useActiveVkuiLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        await bridge.send('VKWebAppInit');
      } catch (err) {
        console.warn('VK Bridge не инициализирован:', err);
      } finally {
        setIsReady(true);
      }
    };
    initApp();
  }, []);

  if (!isReady) {
    return <LoadingScreen isLoading={true} />;
  }

  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot mode="full">
          <SplitLayout popout={null}>
            <SplitCol>
              <View activePanel={activePanel}>
                <RadioPlayer id="radio" />
              </View>
            </SplitCol>
          </SplitLayout>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};