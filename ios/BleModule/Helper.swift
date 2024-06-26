import Foundation
import CoreBluetooth

class Helper {
    
    static func dataToArrayBuffer(_ data: Data) -> [String: Any] {
        return [
            "CDVType": "ArrayBuffer",
            "data": data.base64EncodedString(options: []),
            "bytes": data.map { $0 }
        ]
    }
    
    static func reformatAdvertisementData(_ advertisementData: [String:Any]) -> [String:Any] {
        var adv = advertisementData
        // Rename 'local name' key
        if let localName = adv[CBAdvertisementDataLocalNameKey] {
            adv.removeValue(forKey: CBAdvertisementDataLocalNameKey)
            adv["localName"] = localName
        }
        
        // Rename 'isConnectable' key
        if let isConnectable = adv[CBAdvertisementDataIsConnectable] {
            adv.removeValue(forKey: CBAdvertisementDataIsConnectable)
            adv["isConnectable"] = isConnectable
        }
        
        // Rename 'power level' key
        if let powerLevel = adv[CBAdvertisementDataTxPowerLevelKey] {
            adv.removeValue(forKey: CBAdvertisementDataTxPowerLevelKey)
            adv["txPowerLevel"] = powerLevel
        }
        
        // Service Data is a dictionary of CBUUID and NSData
        // Convert to String keys with Array Buffer values
        if let serviceData = adv[CBAdvertisementDataServiceDataKey] as? NSMutableDictionary {
            for (key, value) in serviceData {
                if let uuidKey = key as? CBUUID, let dataValue = value as? Data {
                    serviceData.removeObject(forKey: uuidKey)
                    serviceData[uuidKey.uuidString.lowercased()] = Helper.dataToArrayBuffer(dataValue)
                }
            }
            
            adv.removeValue(forKey: CBAdvertisementDataServiceDataKey)
            adv["serviceData"] = serviceData
        }
        
        // Create a new list of Service UUIDs as Strings instead of CBUUIDs
        if let serviceUUIDs = adv[CBAdvertisementDataServiceUUIDsKey] as? NSMutableArray {
            var serviceUUIDStrings:Array<String> = []
            for value in serviceUUIDs {
                if let uuid = value as? CBUUID {
                    serviceUUIDStrings.append(uuid.uuidString.lowercased())
                }
            }
            
            adv.removeValue(forKey: CBAdvertisementDataServiceUUIDsKey)
            adv["serviceUUIDs"] = serviceUUIDStrings
        }
        // Solicited Services UUIDs is an array of CBUUIDs, convert into Strings
        if let solicitiedServiceUUIDs = adv[CBAdvertisementDataSolicitedServiceUUIDsKey] as? NSMutableArray {
            var solicitiedServiceUUIDStrings:Array<String> = []
            for value in solicitiedServiceUUIDs {
                if let uuid = value as? CBUUID {
                    solicitiedServiceUUIDStrings.append(uuid.uuidString.lowercased())
                }
            }
            
            adv.removeValue(forKey: CBAdvertisementDataSolicitedServiceUUIDsKey)
            adv["solicitedServiceUUIDs"] = solicitiedServiceUUIDStrings
        }
        
        // Overflow Services UUIDs is an array of CBUUIDs, convert into Strings
        if let overflowServiceUUIDs = adv[CBAdvertisementDataOverflowServiceUUIDsKey] as? NSMutableArray {
            var overflowServiceUUIDStrings:Array<String> = []
            for value in overflowServiceUUIDs {
                if let uuid = value as? CBUUID {
                    overflowServiceUUIDStrings.append(uuid.uuidString.lowercased())
                }
            }
            
            adv.removeValue(forKey: CBAdvertisementDataOverflowServiceUUIDsKey)
            adv["overflowServiceUUIDs"] = overflowServiceUUIDStrings
        }
        
        // Convert the manufacturer data
        if let mfgData = adv[CBAdvertisementDataManufacturerDataKey] as? Data {
            if mfgData.count > 1 {
                let manufactureID = UInt16(mfgData[0]) + UInt16(mfgData[1]) << 8
                var manInfo: [String: Any] = [:]
                manInfo[String(format: "%04x", manufactureID)] = Helper.dataToArrayBuffer(mfgData.subdata(in: 2..<mfgData.endIndex))
                adv["manufacturerData"] = manInfo
            }
            adv.removeValue(forKey: CBAdvertisementDataManufacturerDataKey)
            adv["manufacturerRawData"] = Helper.dataToArrayBuffer(mfgData)
            
        }
        
        return adv
    }
}

class Peripheral:Hashable {
    var instance: CBPeripheral
    var rssi: NSNumber?
    var advertisementData: [String:Any]?
    
    init(peripheral: CBPeripheral, rssi: NSNumber? = nil, advertisementData: [String:Any]? = nil) {
        self.instance = peripheral
        self.rssi = rssi
        self.advertisementData = advertisementData
    }
    
    func setRSSI(_ newRSSI: NSNumber?) {
        self.rssi = newRSSI
    }
    
    func setAdvertisementData(_ advertisementData: [String:Any]) {
        self.advertisementData = advertisementData
    }
    
    func advertisingInfo() -> Dictionary<String, Any> {
        var peripheralInfo: [String: Any] = [:]
        
        peripheralInfo["name"] = instance.name
        peripheralInfo["id"] = instance.uuidAsString()
        peripheralInfo["rssi"] = self.rssi
        if let adv = self.advertisementData {
            peripheralInfo["advertising"] = Helper.reformatAdvertisementData(adv)
        }
        
        return peripheralInfo
    }
    
    func servicesInfo() -> Dictionary<String, Any> {
        var servicesInfo: [String: Any] = advertisingInfo()
        
        var serviceList = [[String: Any]]()
        var characteristicList = [[String: Any]]()
        
        for service in instance.services ?? [] {
            var serviceDictionary = [String: Any]()
            serviceDictionary["uuid"] = service.uuid.uuidString.lowercased()
            serviceList.append(serviceDictionary)
            
            for characteristic in service.characteristics ?? [] {
                var characteristicDictionary = [String: Any]()
                characteristicDictionary["service"] = service.uuid.uuidString.lowercased()
                characteristicDictionary["characteristic"] = characteristic.uuid.uuidString.lowercased()
                
                if let value = characteristic.value, value.count > 0 {
                    characteristicDictionary["value"] = Helper.dataToArrayBuffer(value)
                }
                
                // TODO: Need to fill properties of characteristic here
                characteristicDictionary["isNotifying"] = characteristic.isNotifying
                
                var descriptorList = [[String: Any]]()
                for descriptor in characteristic.descriptors ?? [] {
                    var descriptorDictionary = [String: Any]()
                    descriptorDictionary["uuid"] = descriptor.uuid.uuidString.lowercased()
                    
                    if let value = descriptor.value {
                        descriptorDictionary["value"] = value
                    }
                    
                    descriptorList.append(descriptorDictionary)
                }
                
                if descriptorList.count > 0 {
                    characteristicDictionary["descriptors"] = descriptorList
                }
                
                characteristicList.append(characteristicDictionary)
            }
        }
        
        servicesInfo["services"] = serviceList
        servicesInfo["characteristics"] = characteristicList
        
        return servicesInfo
    }
    
    
    static func == (lhs: Peripheral, rhs: Peripheral) -> Bool {
        return lhs.instance.uuidAsString() == rhs.instance.uuidAsString()
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(instance.uuidAsString())
    }
}

extension CBPeripheral {
    
    func uuidAsString() -> String {
        return self.identifier.uuidString.lowercased()
    }
}
