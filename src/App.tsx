import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Toast from 'react-native-simple-toast';
import useBLE from './ble/useBLE';
import {Peripheral} from './ble/src/types';

const App = () => {
  const {
    start,
    scanForPeripherals,
    allPeripherals,
    onStartScanning,
    onStopScanning,
  } = useBLE();
  const [isScanning, setIsScanning] = useState(false);

  onStartScanning(() => {
    setIsScanning(true);
    Toast.show('Start scanning ...', Toast.LONG, {
      backgroundColor: 'blue',
    });
  });

  onStopScanning(() => {
    setIsScanning(false);
    Toast.show('Scanning stopped', Toast.SHORT, {
      backgroundColor: 'red',
    });
  });

  console.log('*** BLE', allPeripherals);

  useEffect(() => {
    start();
  }, []);

  const renderItem = ({item}: {item: Peripheral}) => {
    const backgroundColor = 'rgb(16, 91, 160)';
    return (
      <TouchableOpacity onPress={() => {}}>
        <View style={[styles.row, {backgroundColor}]}>
          <Text style={styles.peripheralName}>
            {item.name} - {item?.advertising?.localName}
          </Text>
          <Text style={styles.rssi}>RSSI: {item.rssi}</Text>
          <Text style={styles.peripheralId}>{item.id}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          disabled={isScanning}
          onPress={() => {
            if (isScanning) return;
            setIsScanning(!isScanning);
            scanForPeripherals();
          }}
          style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>
            {isScanning ? 'Scanning ...' : 'Scan bluetooth'}
          </Text>
        </TouchableOpacity>
        {Array.from(allPeripherals.values()).length === 0 && (
          <View style={styles.rowNoPeripheral}>
            <Text style={styles.noPeripherals}>
              No Peripherals, press "Scan Bluetooth" above.
            </Text>
          </View>
        )}
        {Array.from(allPeripherals.values()).length > 0 && (
          <View style={styles.rowNoPeripheral}>
            <Text style={styles.noPeripherals}>List of peripherals:</Text>
          </View>
        )}

        <FlatList
          style={{marginTop: 20}}
          data={allPeripherals}
          contentContainerStyle={{rowGap: 12}}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    </>
  );
};

const boxShadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: 'black',
  },
  ctaButton: {
    backgroundColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  peripheralName: {
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
    fontWeight: 'bold',
  },
  rssi: {
    fontSize: 12,
    textAlign: 'center',
    padding: 2,
  },
  peripheralId: {
    fontSize: 12,
    textAlign: 'center',
    padding: 2,
    paddingBottom: 20,
  },
  row: {
    marginHorizontal: 20,
    borderRadius: 10,
    ...boxShadow,
  },
  rowNoPeripheral: {
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    ...boxShadow,
  },
  noPeripherals: {
    // margin: 10,
    textAlign: 'center',
    color: Colors.white,
  },
});

export default App;
