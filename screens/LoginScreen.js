import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = "https://tu-proyecto-en-vercel.vercel.app/api"; // Cambiaremos esto al desplegar

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Intentar login automático al abrir
  useEffect(() => {
    checkSavedSession();
  }, []);

  const checkSavedSession = async () => {
    const savedUser = await SecureStore.getItemAsync('user_session');
    if (savedUser) {
      onLoginSuccess(JSON.parse(savedUser));
    }
  };

  const handleAuth = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    setLoading(true);
    const endpoint = isRegistering ? '/register' : '/login';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.toLowerCase(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar sesión para "Recordar"
        await SecureStore.setItemAsync('user_session', JSON.stringify(data.user || data));
        onLoginSuccess(data.user || data);
      } else {
        Alert.alert("Error", data.error || "Algo salió mal");
      }
    } catch (error) {
      Alert.alert("Error de conexión", "No se pudo contactar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegistering ? "Crear Cuenta" : "Famaz Rastreo"}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : 
          <Text style={styles.buttonText}>{isRegistering ? "Registrarse" : "Ingresar"}</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
        <Text style={styles.switchText}>
          {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchText: { marginTop: 20, textAlign: 'center', color: '#007AFF' }
});