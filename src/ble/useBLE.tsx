/* eslint-disable no-bitwise */
import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

const bleManager = new BleManager();

type VoidCallback = () => void;
type BooleanCallback = (result: boolean) => void;

/**
 * Interface to get data of peripherals
 */
export interface Peripheral {
  /**
   * `id` of each peripheral to identify and differentate between peripheral
   */
  id: string;

  /**
   * `rssi` is stands for Received Signal Strength Indication of peripheral
   */
  rssi: number | null;

  /**
   * `name` of peripheral if present
   */
  name?: string;

  /**
   * `advertisementData` of peripheral if present
   */
  advertisementData: AdvertisementData;
}
export interface AdvertisementData {
  /**
   * Is Peripheral connectable. [iOS only]
   */
  isConnectable?: boolean | null;

  /**
   * User friendly name of Peripheral.
   */
  localName?: string | null;

  /**
   * Peripheral's custom manufacturer data. Its format is defined by manufacturer.
   */
  manufactureData?: string | null;

  /**
   * Map of service UUIDs (as keys) with associated data (as values).
   */
  serviceData?: {[uuid: string]: string} | null;

  /**
   * List of available services visible during scanning.
   */
  serviceUUIDs?: string[] | null;

  /**
   * Transmission power level of peripheral.
   */
  txPowerLevel?: number;
}

interface BluetoothLowEnergyApi {
  /**
   * If you need to handle event after request permission manually, you can use this.
   */
  requestPermissions(cb: BooleanCallback): Promise<void>;

  /**
   * Start to scan for peripherals
   */
  scanForPeripherals(): void;

  /**
   * Get all peripherals, use this as you use state of useState
   * Usually use this on your data in `FlatList`
   */
  allPeripherals: Peripheral[];

  /**
   * Callback to handle when scanning started
   */
  onStartScanning(cb: VoidCallback): Promise<void>;

  /**
   * Callback to handle when scanning stopped
   */
  onStopScanning(cb: VoidCallback): Promise<void>;
}

function useBLE(): BluetoothLowEnergyApi {
  const [allPeripherals, setAllPeripherals] = useState<Peripheral[]>([]);

  const requestPermissions = async (cb: BooleanCallback) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      cb(true);
    }
  };

  let onStart = () => {};
  const onStartScanning = async (cb: VoidCallback) => {
    onStart = cb;
  };

  let onStop = () => {};
  const onStopScanning = async (cb: VoidCallback) => {
    onStop = cb;
  };

  const isDuplictePeripherals = (
    peripherals: Peripheral[],
    nextPeripheral: Peripheral,
  ) =>
    peripherals.findIndex(peripheral => nextPeripheral.id === peripheral.id) >
    -1;

  const scanForPeripherals = () => {
    onStart();
    bleManager.startDeviceScan(null, null, (error, device) => {
      onStop();
      console.log('*** device', device);
      if (error) {
        console.log(error);
      }
      if (device) {
        let advertisementData: AdvertisementData = {
          isConnectable: device.isConnectable,
          localName: device.localName,
          serviceUUIDs: device.serviceUUIDs,
          manufactureData: device.manufacturerData,
          serviceData: device.serviceData,
        };

        let peripheral: Peripheral = {
          id: device.id,
          name: device.name ? device.name : 'no name',
          rssi: device.rssi ? device.rssi : null,
          advertisementData: advertisementData,
        };

        setAllPeripherals((prevState: Peripheral[]) => {
          if (!isDuplictePeripherals(prevState, peripheral)) {
            return [...prevState, peripheral];
          }
          return prevState;
        });
      }
    });
  };

  return {
    scanForPeripherals,
    requestPermissions,
    allPeripherals,
    onStartScanning,
    onStopScanning,
  };
}

export default useBLE;
