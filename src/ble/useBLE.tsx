import {useState} from 'react';
import {NativeModules, NativeEventEmitter} from 'react-native';

import BleModule, {Peripheral} from './src';

const NativeBleModule = NativeModules.BleModule;
const bleModuleEmitter = new NativeEventEmitter(NativeBleModule);

type VoidCallback = () => void;

interface BluetoothLowEnergyApi {
  /**
   * Initiate the module. Usually call this on `useEffect`.
   */
  start(): void;

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

  const start = () => {
    try {
      BleModule.start({showAlert: false})
        .then(() => console.debug('BleModule started.'))
        .catch((error: any) =>
          console.error('BleModule could not be started.', error),
        );
    } catch (error) {
      console.error('unexpected error starting BleManager.', error);
      return;
    }

    const listeners = [
      bleModuleEmitter.addListener(
        'BleModuleDiscoverPeripheral',
        handleDiscoverPeripheral,
      ),
    ];

    return () => {
      console.debug('[app] main component unmounting. Removing listeners...');
      for (const listener of listeners) {
        listener.remove();
      }
    };
  };

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    onStop();
    console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }

    if (peripheral) {
      setAllPeripherals((prevState: Peripheral[]) => {
        if (!isDuplictePeripherals(prevState, peripheral)) {
          return [...prevState, peripheral];
        }
        return prevState;
      });
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
    try {
      onStart();
      console.debug('[startScan] starting scan...');
      BleModule.scan([], 3, true, {
        matchMode: 2,
        scanMode: 2,
        callbackType: 1,
      })
        .then(() => {
          console.debug('[startScan] scan promise returned successfully.');
        })
        .catch((err: any) => {
          console.error('[startScan] ble scan returned in error', err);
        });
    } catch (error) {
      console.error('[startScan] ble scan error thrown', error);
    }
  };

  return {
    start,
    scanForPeripherals,
    allPeripherals,
    onStartScanning,
    onStopScanning,
  };
}

export default useBLE;
