import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import MapScreen from './screens/MapScreen';

export default function App() {
  const [user, setUser] = useState(null);

  // Función para cerrar sesión (borra el estado del usuario)
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {!user ? (
        <LoginScreen onLoginSuccess={(userData) => setUser(userData)} />
      ) : (
        <MapScreen user={user} onLogout={handleLogout} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});