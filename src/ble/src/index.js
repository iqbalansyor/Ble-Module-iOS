import { NativeEventEmitter, NativeModules } from "react-native";
import { BleScanCallbackType, BleScanMatchCount, BleScanMatchMode, BleScanMode, } from "./types";
export * from "./types";
let bleModule = NativeModules.BleModule;
class BleModule extends NativeEventEmitter {
    constructor() {
        super(bleModule);
    }

    /**
    * Initialize `BLEModule`
    * This is to initalize value of Native Modules
    */
    start(options) {
        return new Promise((fulfill, reject) => {
            if (options == null) {
                options = {};
            }
            bleModule.start(options, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    fulfill();
                }
            });
        });
    }

    /**
     *
     * @param serviceUUIDs
     * @param seconds amount of seconds to scan. if set to 0 or less, will scan until you call stopScan() or the OS stops the scan (background etc).
     * @param allowDuplicates
     * @param scanningOptions optional map of properties to fine-tune scan behavior, see DOCS.
     * @returns
     */
    scan(serviceUUIDs, seconds, allowDuplicates, scanningOptions = {}) {
        return new Promise((fulfill, reject) => {
            if (allowDuplicates == null) {
                allowDuplicates = false;
            }
            if (scanningOptions.reportDelay == null) {
                scanningOptions.reportDelay = 0;
            }
            if (!scanningOptions.exactAdvertisingName) {
                delete scanningOptions.exactAdvertisingName;
            }
            else {
                if (typeof scanningOptions.exactAdvertisingName === "string") {
                    scanningOptions.exactAdvertisingName = [
                        scanningOptions.exactAdvertisingName,
                    ];
                }
            }
            bleModule.scan(serviceUUIDs, seconds, allowDuplicates, scanningOptions, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    fulfill();
                }
            });
        });
    }
}
export default new BleModule();