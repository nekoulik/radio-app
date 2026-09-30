import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, AppRoot } from '@vkontakte/vkui';

import { RadioPlayer } from './components/RadioPlayer';
import { LoadingScreen } from './components/LoadingScreen';

export const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    bridge.send('VKWebAppInit')
      .catch(() => { })
      .finally(() => setIsReady(true));
  }, []);

  if (!isReady) return <LoadingScreen isLoading={true} />;

  return (
    <AppRoot>
      <SplitLayout>
        <SplitCol>
          <View activePanel="radio">
            <RadioPlayer id="radio" />
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>
  );
};