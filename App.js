import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import MapScreen from './screens/MapScreen';

export default function App() {
  const [user, setUser] = useState(null);

  // Si no hay usuario, mostramos el Login.
  // Al loguearse, el componente LoginScreen llamará a setUser con los datos del usuario.
  if (!user) {
    return (
      <View style={styles.container}>
        <LoginScreen onLoginSuccess={(userData) => setUser(userData)} />
      </View>
    );
  }

  // Si ya hay usuario, mostramos el Mapa.
  return (
    <View style={styles.container}>
      <MapScreen user={user} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});