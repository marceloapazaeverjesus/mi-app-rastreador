import React, { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import { View, Text } from 'react-native';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginScreen onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>¡Bienvenido, {user.username}!</Text>
      <Text>Aquí irá el Mapa y el Rastreador GPS...</Text>
    </View>
  );
}