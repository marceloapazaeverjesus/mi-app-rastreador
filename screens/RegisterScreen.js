import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const ejecutarRegistro = async () => {
    try {
      // USAMOS TU URL DE VERCEL
      const response = await fetch('https://mi-app-rastreo.vercel.app/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Éxito", "Usuario creado. Ahora puedes iniciar sesión.");
      } else {
        Alert.alert("Error", data.error || "No se pudo registrar.");
      }
    } catch (error) {
      Alert.alert("Error de red", "Verifica tu conexión a internet.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Usuario" onChangeText={setUsername} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
      <TextInput placeholder="Email" onChangeText={setEmail} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
      <TextInput placeholder="Contraseña" secureTextEntry onChangeText={setPassword} style={{ borderBottomWidth: 1, marginBottom: 20 }} />
      <Button title="Crear Cuenta" onPress={ejecutarRegistro} color="#2196F3" />
    </View>
  );
}