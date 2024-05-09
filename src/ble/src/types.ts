/**
 * * ios states: https://developer.apple.com/documentation/corebluetooth/cbcentralmanagerstate
 * */
export enum BleState {
  Unknown = 'unknown',
  Resetting = 'resetting',
  Unsupported = 'unsupported',
  Unauthorized = 'unauthorized',
  On = 'on',
  Off = 'off',
}

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
  rssi: number;

  /**
   * `name` of peripheral if present
   */
  name?: string;

  /**
   * `AdvertisingData` of peripheral if present
   */
  advertising: AdvertisingData;
}
export interface AdvertisingData {
  /**
   * Is Peripheral connectable.
   */
  isConnectable?: boolean;

  /**
   * User friendly name of Peripheral.
   */
  localName?: string;

  /**
   * Peripheral's raw data.
   */
  rawData?: CustomAdvertisingData;

  /**
   * Peripheral's custom manufacturer data. Its format is defined by manufacturer.
   */
  manufacturerData?: Record<string, CustomAdvertisingData>;

  /**
   * Peripheral's service data. Its format is defined by manufacturer.
   */
  serviceData?: Record<string, CustomAdvertisingData>;

  /**
   * List of available services visible during scanning.
   */
  serviceUUIDs?: string[];

  /**
   * Transmission power level of peripheral.
   */
  txPowerLevel?: number;
}
export interface CustomAdvertisingData {
  CDVType: 'ArrayBuffer';
  /**
   * data as an array of numbers (which can be converted back to a Uint8Array (ByteArray),
   * using something like [Buffer.from()](https://github.com/feross/buffer))
   */
  bytes: number[];
  /**
   * base64-encoded string of the data
   */
  data: string;
}

export interface Service {
  uuid: string;
}
export interface Descriptor {
  value: string;
  uuid: string;
}
export interface Characteristic {
  /**
   * See https://developer.apple.com/documentation/corebluetooth/cbcharacteristicproperties
   */
  properties: {
    Broadcast?: 'Broadcast';
    Read?: 'Read';
    WriteWithoutResponse?: 'WriteWithoutResponse';
    Write?: 'Write';
    Notify?: 'Notify';
    Indicate?: 'Indicate';
    AuthenticatedSignedWrites?: 'AuthenticatedSignedWrites';
    ExtendedProperties?: 'ExtendedProperties';
    NotifyEncryptionRequired?: 'NotifyEncryptionRequired';
    IndicateEncryptionRequired?: 'IndicateEncryptionRequired';
  };
  characteristic: string;
  service: string;
  descriptors?: Descriptor[];
}
export interface PeripheralInfo extends Peripheral {
  serviceUUIDs?: string[];
  characteristics?: Characteristic[];
  services?: Service[];
}
