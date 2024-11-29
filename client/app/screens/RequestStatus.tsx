import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  View
} from "react-native";
import { IDriver, MockDrivers } from '../@types/driver';
import { RequestStatusEnum } from '../@types/request';
import { RideStatusEnum } from '../@types/ride';
import { RoutesEnum } from '../@types/routes';
import { StackParams } from '../@types/stack';
import RequestPending from '../components/RequestPending';
import RideInProgress from '../components/RideInProgress';

const RequestStatus: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const [requestStatus, setRequestStatus] = useState(RequestStatusEnum.PENDING);
  const [driver, setDriver] = useState<IDriver | null>(null);
  const [rideStatus, setRideStatus] = useState<RideStatusEnum | null>(null);

  const handleCancelRequest = () => {
    Alert.alert("Request Cancelled", "Your ride request has been cancelled.");
    setRequestStatus(RequestStatusEnum.CANCELLED);
    navigation.navigate(RoutesEnum.LANDING);
  };

  const handleDriverMatched = () => {
    setRequestStatus(RequestStatusEnum.MATCHED);
    Alert.alert("Request Accepted", "Driver has accepted your ride request.");
    setDriver(MockDrivers[1]);
  };

  const handleFinishRide = () => {
    setDriver(null);
    setRideStatus(RideStatusEnum.FINISHED);
    navigation.navigate(RoutesEnum.LANDING);
    Alert.alert("Ride Finished", "Thank you for completing the ride!");
  };

  return (
    <View className="flex-1 bg-white">
      {(requestStatus === RequestStatusEnum.PENDING) ? (
        <RequestPending
          onDriverMatched={handleDriverMatched}
          onCancel={handleCancelRequest}
        />
      ) : (requestStatus === RequestStatusEnum.MATCHED && driver) ? (
        <RideInProgress
          onFinish={handleFinishRide}
          driver={driver}
        />
      ) : null
      }
    </View>
  );
};

export default RequestStatus;