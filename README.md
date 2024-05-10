# BLE Module iOS

## Preview

<img width="354" alt="Screenshot 2024-05-10 at 09 55 29" src="https://github.com/iqbalansyor/Ble-Module-iOS/assets/39257167/2684f448-0629-4aea-82d6-fb167e10c12a">
<img width="360" alt="Screenshot 2024-05-10 at 09 55 10" src="https://github.com/iqbalansyor/Ble-Module-iOS/assets/39257167/33e76d5c-7bed-41c6-bc90-bc6f19b00b24">

### BLE Module
#### `useBLE`: wrapper of `BLE` module, documented on the code (https://github.com/iqbalansyor/Ble-Module-iOS/blob/main/src/ble/useBLE.tsx)

List of function/props can use in `useBLE`:

- `start()` : Initiate the module. Usually call this on `useEffect`.
- `scanForPeripherals()`: Start to scan for peripherals
- `allPeripherals`: Get all peripherals, use this as you use state of useState
- `onStartScanning(cb: VoidCallback)`: Pass your callback here, will called when scan started
- `onStopScanning(cb: VoidCallback)`: Pass your callback here, will called when scan stopped

#### `BLE`: Bluetooth low energy javascript module (https://github.com/iqbalansyor/Ble-Module-iOS/tree/main/src/ble/src)
#### `BleModule`: Bluetooth low energy iOS native modules (https://github.com/iqbalansyor/Ble-Module-iOS/tree/main/ios/BleModule)

### Usage BLE Module

```
import useBLE from './ble/useBLE';

const App = () => {
  const {
    start,
    scanForPeripherals,
    allPeripherals,
    onStartScanning,
    onStopScanning,
  } = useBLE();

// .... use function and props on your component

````

you can see the usage here (https://github.com/iqbalansyor/Ble-Module-iOS/blob/main/src/App.tsx)
  
### Run the application

1) Clone the repository
2) Install  dependencies: `npm install`
3) For ios, run cd ios && `pod install` && `cd ..`
4) Run `npm run start` || `npm run ios` 

## Contact me
* **Iqbal Ansyori** - [ansyori.iqbal@gmail.com](mailto:ansyori.iqbal@gmail.com)
