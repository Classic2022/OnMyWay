import { useRoute } from '@react-navigation/native';
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { IDriver } from '../@types/driver';
import { IRoute } from '../@types/ride';
import { IRider } from '../@types/rider';

interface IRideInProgress {
  driver?: IDriver;
  rider?: IRider;
  onFinish: () => void;
}

const RideInProgress: React.FC<IRideInProgress> = ({ driver, rider, onFinish }) => {
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const { from, to } = useRoute().params as IRoute;

  // Mock locations for Berlin Airport and Kreuzberg
  const dropOffLocation = {
    latitude: 52.4934, // Kreuzberg, Berlin
    longitude: 13.4233,
  };

  const driverLocation = {
    latitude: 52.5597, // Berlin Airport
    longitude: 13.2877,
  };

  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        return;
      }

      setLocation(driverLocation); // Using mock driver's location

      // Calculate distance and time
      const distanceToDropOff = calculateDistance(
        driverLocation.latitude,
        driverLocation.longitude,
        dropOffLocation.latitude,
        dropOffLocation.longitude
      );
      const distanceToDropOffNumber = parseFloat(distanceToDropOff);
      setDistance(distanceToDropOffNumber);

      // Approximate time in minutes (assuming 50km/h average speed)
      const timeToDropOff = (distanceToDropOffNumber / 50) * 60;
      setTime(Math.ceil(timeToDropOff));
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (driver) {
      timeout = setTimeout(() => {
        onFinish();
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [driver]);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance.toFixed(1); // Round to 1 decimal place
  };

  // TODO: Implement chat and call functionality
  const handleChat = (name: string) => {
    Alert.alert("Chat", `Start chatting with ${name}`);
  };

  const handleCall = (name: string) => {
    Alert.alert("Call", `Calling ${name}`);
  };

  return (
    <>
      <MapView
        className="flex-1 h-72 rounded-lg mb-4"
        initialRegion={{
          latitude: 52.520008,
          longitude: 13.404954,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <Marker
          coordinate={{
            latitude: 52.520008,
            longitude: 13.404954,
          }}
          title="Driver"
          description="Your current location"
          pinColor="blue"
        />
        {driver && (
          <Marker
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            title={driver.name}
            description="Driver's Location"
            pinColor="red"
          />
        )}
        {rider && (
          <Marker
            coordinate={{
              latitude: 52.499508,
              longitude: 13.397634,
            }}
            title={rider.name}
            description="Passenger Pickup Location"
            pinColor="green"
          />
        )}
        <Polyline
          coordinates={[
            { latitude: 52.520008, longitude: 13.404954 },
            { latitude: 52.499508, longitude: 13.397634 },
          ]}
          strokeColor="#0000FF"
          strokeWidth={3}
        />
      </MapView>

      {/* Rider Info Section */}
      <View className="p-4 mb-4 items-center">
        {rider && (
          <Text className="text-2xl text-center">
            You are driving with{" "}
            <Text className='text-2xl font-black'>
              {rider.name}
            </Text>
          </Text>
        )}

        {driver && (
          <View className="flex text-2xl items-center">
            <Text className='text-2xl'>
              You driver is{" "}
              <Text className='text-2xl font-black'>
                {driver.name}
              </Text>
            </Text>
            <Text>
              <Text className='text-2xl'>
                Vehicle type:{' '}
                <Text className='font-black'>
                  {driver.vehicle}
                </Text>
              </Text>
            </Text>
            <Text className='text-2xl'>
              Licence number:{' '}
              <Text className='font-black'>
                {driver.license}
              </Text>
            </Text>
          </View>
        )}

        <View>
          <Text className="text-2xl text-center mb-4">
            from{" "}
            <Text className="font-black">{from}</Text> to{" "}
            <Text className="font-black">{to}</Text>
          </Text>
        </View>
        <View className="bg-white p-4 mx-4 mb-4 flex items-center">
          <Text className="text-l text-black mb-2">
            <Text className='font-black'>
              DISTANCE TO DROP-OFF:
            </Text>
            {" "}{distance} km
          </Text>
          <Text className="text-l text-black">
            <Text className='font-black'>
              TIME LEFT:
            </Text>
            {" "}{time} mins
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      {rider && (
        <View className="flex-row justify-between m-4 space-x-4">
          <TouchableOpacity
            className="flex-1 bg-black p-4 items-center"
            onPress={onFinish}
          >
            <Text className="text-white font-black text-base">FINISH RIDE</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default RideInProgress;