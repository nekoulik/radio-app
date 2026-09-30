import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, AppRoot } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import { RadioPlayer } from './components/RadioPlayer';

export const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    bridge.send('VKWebAppInit')
      .catch(() => { })
      .finally(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <AppRoot>
        <SplitLayout>
          <SplitCol>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontSize: '18px'
            }}>
              Загрузка...
            </div>
          </SplitCol>
        </SplitLayout>
      </AppRoot>
    );
  }

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