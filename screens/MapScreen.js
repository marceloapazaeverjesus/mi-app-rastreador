import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps'; // Usaremos UrlTile para OpenStreetMap
import * as Location from 'expo-location';

export default function MapScreen({ user }) {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    startTracking();
  }, []);

  const startTracking = async () => {
    // 1. Pedir permisos
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    // 2. Rastreo de alta precisión (cada 1 metro)
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 1, // <--- AQUÍ: Actualiza cada 1 metro
        timeInterval: 5000,   // O cada 5 segundos si está quieto
      },
      (newLocation) => {
        const { latitude, longitude } = newLocation.coords;
        setLocation(newLocation.coords);
        
        // 3. Enviar a Vercel
        sendLocationToServer(latitude, longitude);
      }
    );
  };

  const sendLocationToServer = async (lat, lng) => {
    try {
      await fetch("https://mi-app-rastreo.vercel.app/api/location", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          latitude: lat,
          longitude: lng
        }),
      });
    } catch (e) {
      console.log("Error enviando ubicación:", e);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -12.162, // Coordenadas aproximadas de VMT
          longitude: -76.936,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Capa de OpenStreetMap */}
        <UrlTile 
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {location && (
          <Marker
            coordinate={location}
            title={user.username}
            description="Tú estás aquí"
            pinColor="blue"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
});