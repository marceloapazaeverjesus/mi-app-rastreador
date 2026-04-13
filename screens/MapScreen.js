import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; 
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

export default function MapScreen({ user, onLogout }) {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    startTracking();
  }, []);

  const startTracking = async () => {
    // 1. Pedir permisos de ubicación
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Se requiere GPS para el rastreo en tiempo real.");
      return;
    }

    // 2. Suscribirse a cambios de ubicación (Cada 1 metro)
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 1, // Actualiza cada 1 metro de movimiento
        timeInterval: 5000,  
      },
      (newLocation) => {
        const { latitude, longitude } = newLocation.coords;
        setLocation(newLocation.coords);
        
        // 3. Enviar coordenadas a Vercel
        sendLocationToServer(latitude, longitude);
      }
    );
  };

  const sendLocationToServer = async (lat, lng) => {
    try {
      const response = await fetch("https://mi-app-rastreador.vercel.app/api/location", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          latitude: lat,
          longitude: lng
        }),
      });
      const resData = await response.json();
      console.log("Ubicación enviada:", resData);
    } catch (e) {
      console.log("Error de conexión al enviar ubicación:", e);
    }
  };

  const handleSignOut = async () => {
    await SecureStore.deleteItemAsync('user_session');
    onLogout();
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true} // Muestra el punto azul nativo
        initialRegion={{
          latitude: -12.162, // Centro en VMT, Lima
          longitude: -76.936,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {location && (
          <Marker
            coordinate={location}
            title={`Usuario: ${user.username}`}
            description="Transmitiendo cada 1 metro"
            pinColor="red"
          />
        )}
      </MapView>

      {/* Botón Flotante para Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  map: { 
    width: Dimensions.get('window').width, 
    height: Dimensions.get('window').height 
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
    elevation: 5
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold'
  }
});