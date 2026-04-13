import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; 
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

export default function MapScreen({ user, onLogout }) {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null); // Para controlar el mapa programáticamente

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
        distanceInterval: 1, 
        timeInterval: 5000,  
      },
      (newLocation) => {
        const { latitude, longitude } = newLocation.coords;
        const coords = { latitude, longitude };
        
        setLocation(coords);
        
        // 3. Enviar coordenadas a Vercel
        sendLocationToServer(latitude, longitude);

        // Opcional: Centrar el mapa suavemente cuando te mueves
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...coords,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }, 1000);
        }
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
      console.log("Ubicación enviada correctamente");
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
        ref={mapRef}
        provider={PROVIDER_GOOGLE} // FUERZA EL USO DE GOOGLE MAPS
        style={styles.map}
        showsUserLocation={true} 
        followsUserLocation={true} // El mapa seguirá al punto azul
        initialRegion={{
          latitude: -12.162, 
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
    backgroundColor: 'rgba(215, 0, 0, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  }
});