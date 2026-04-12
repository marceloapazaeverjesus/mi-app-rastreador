import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data;
    const { latitude, longitude } = locations[0].coords;

    // Aquí enviamos la ubicación al servidor incluso si la app está cerrada
    try {
      await fetch("https://mi-app-rastreador.vercel.app/api/location", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // Nota: Aquí deberías obtener el ID dinámicamente o guardarlo en una variable global
          latitude,
          longitude
        }),
      });
    } catch (e) {
      console.log("Error en background task:", e);
    }
  }
});

export const startBackgroundUpdate = async () => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status === 'granted') {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 1, // 1 metro
      deferredUpdatesInterval: 5000, 
      foregroundService: {
        notificationTitle: "Rastreo Activo",
        notificationBody: "Tu ubicación se está compartiendo en tiempo real",
      }
    });
  }
};