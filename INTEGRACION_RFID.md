# 📡 Guía de Integración RFID Bluetooth

## 🎯 Objetivo
Conectar bastones lectores RFID Bluetooth con la app móvil para escaneo automático de caravanas electrónicas.

---

## 🔧 Hardware Compatible

### Lectores Recomendados para Argentina

#### 1. Allflex RS420
- **Estándar:** ISO 11784/11785 FDX-B
- **Frecuencia:** 134.2 kHz
- **Rango:** Hasta 40cm
- **Conectividad:** Bluetooth 4.0
- **Batería:** 14 horas continuas
- **Precio:** ~$120,000 ARS

#### 2. Agrident AWR300
- **Estándar:** ISO 11784/11785 HDX/FDX
- **Frecuencia:** 134.2 kHz
- **Rango:** Hasta 30cm
- **Conectividad:** Bluetooth 4.2
- **Batería:** 16 horas
- **Precio:** ~$105,000 ARS

#### 3. Shearwell Swift Reader
- **Estándar:** ISO 11784/11785
- **Frecuencia:** 134.2 kHz
- **Rango:** Hasta 35cm
- **Conectividad:** Bluetooth 5.0
- **Precio:** ~$95,000 ARS

---

## 📱 Implementación en React Native

### 1. Instalación de Dependencias

```bash
npm install react-native-ble-plx
npm install react-native-permissions

# iOS
cd ios && pod install

# Android - agregar permisos en AndroidManifest.xml
```

### 2. Permisos

#### iOS (Info.plist)
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Necesitamos Bluetooth para escanear caravanas electrónicas</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>Necesitamos Bluetooth para conectar con el lector RFID</string>
```

#### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"/>
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

### 3. Código de Integración

```javascript
import { BleManager } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

class RFIDScanner {
  constructor() {
    this.manager = new BleManager();
    this.connectedDevice = null;
  }

  // Solicitar permisos
  async requestPermissions() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      
      return Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  }

  // Escanear dispositivos Bluetooth
  async scanForReaders(onDeviceFound) {
    console.log('Buscando lectores RFID...');
    
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Error escaneando:', error);
        return;
      }

      // Filtrar por nombres comunes de lectores RFID
      const rfidNames = ['Allflex', 'Agrident', 'Shearwell', 'RFID', 'AWR', 'RS420'];
      const isRFIDReader = rfidNames.some(name => 
        device.name?.includes(name)
      );

      if (isRFIDReader && device.name) {
        console.log('Lector encontrado:', device.name);
        onDeviceFound(device);
      }
    });
  }

  // Detener escaneo
  stopScanning() {
    this.manager.stopDeviceScan();
  }

  // Conectar al lector
  async connect(deviceId) {
    try {
      console.log('Conectando a dispositivo:', deviceId);
      
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevice = device;
      
      console.log('Conectado exitosamente');
      return true;
    } catch (error) {
      console.error('Error conectando:', error);
      return false;
    }
  }

  // Leer caravanas (monitorear notificaciones)
  async startReading(onCaravanaScanned) {
    if (!this.connectedDevice) {
      throw new Error('No hay dispositivo conectado');
    }

    // UUIDs comunes para lectores RFID
    // Estos valores pueden variar según el fabricante
    const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
    const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

    try {
      // Suscribirse a notificaciones
      this.connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Error leyendo característica:', error);
            return;
          }

          if (characteristic?.value) {
            // Decodificar datos
            const caravana = this.parseRFIDData(characteristic.value);
            if (caravana) {
              console.log('Caravana escaneada:', caravana);
              onCaravanaScanned(caravana);
            }
          }
        }
      );
      
      console.log('Escuchando escaneos...');
      return true;
    } catch (error) {
      console.error('Error monitoreando:', error);
      return false;
    }
  }

  // Parsear datos RFID
  parseRFIDData(base64Data) {
    try {
      // Decodificar base64
      const decoded = atob(base64Data);
      
      // Formato típico: "982000XXXYYYYY\r\n" (15 dígitos)
      // 982 = código de país Argentina
      // Los siguientes 12 dígitos son el ID único
      
      const cleaned = decoded.replace(/[^0-9]/g, '');
      
      if (cleaned.length >= 15) {
        // Formato completo: ARG + 15 dígitos
        return 'ARG' + cleaned.substring(0, 15);
      } else if (cleaned.length >= 12) {
        // Solo el ID
        return 'ARG982' + cleaned.substring(0, 12);
      }
      
      return null;
    } catch (error) {
      console.error('Error parseando datos:', error);
      return null;
    }
  }

  // Desconectar
  async disconnect() {
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
        this.connectedDevice = null;
        console.log('Desconectado');
      } catch (error) {
        console.error('Error desconectando:', error);
      }
    }
  }

  // Limpiar
  destroy() {
    this.stopScanning();
    this.disconnect();
    this.manager.destroy();
  }
}

export default RFIDScanner;
```

### 4. Uso en el Componente

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import RFIDScanner from './RFIDScanner';

function ScanScreen() {
  const [scanner] = useState(() => new RFIDScanner());
  const [devices, setDevices] = useState([]);
  const [connected, setConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastCaravana, setLastCaravana] = useState(null);

  useEffect(() => {
    return () => {
      scanner.destroy();
    };
  }, []);

  const startScanning = async () => {
    const hasPermissions = await scanner.requestPermissions();
    
    if (!hasPermissions) {
      alert('Se necesitan permisos de Bluetooth');
      return;
    }

    setDevices([]);
    setScanning(true);

    await scanner.scanForReaders((device) => {
      setDevices(prev => {
        // Evitar duplicados
        if (prev.find(d => d.id === device.id)) {
          return prev;
        }
        return [...prev, device];
      });
    });

    // Detener después de 10 segundos
    setTimeout(() => {
      scanner.stopScanning();
      setScanning(false);
    }, 10000);
  };

  const connectToDevice = async (deviceId) => {
    scanner.stopScanning();
    setScanning(false);

    const success = await scanner.connect(deviceId);
    
    if (success) {
      setConnected(true);
      
      // Empezar a leer caravanas
      await scanner.startReading((caravana) => {
        setLastCaravana(caravana);
        
        // Aquí llamar a tu API para obtener datos del animal
        fetchAnimalData(caravana);
      });
    } else {
      alert('No se pudo conectar al lector');
    }
  };

  const fetchAnimalData = async (caravana) => {
    // Tu lógica existente para buscar el animal
    console.log('Buscando animal:', caravana);
  };

  const disconnect = async () => {
    await scanner.disconnect();
    setConnected(false);
    setLastCaravana(null);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Lector RFID Bluetooth
      </Text>

      {!connected ? (
        <>
          <Button
            title={scanning ? "Buscando..." : "Buscar Lectores"}
            onPress={startScanning}
            disabled={scanning}
          />

          <FlatList
            data={devices}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={{ 
                padding: 15, 
                marginTop: 10, 
                backgroundColor: '#f0f0f0',
                borderRadius: 8
              }}>
                <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {item.id}
                </Text>
                <Button
                  title="Conectar"
                  onPress={() => connectToDevice(item.id)}
                />
              </View>
            )}
          />
        </>
      ) : (
        <>
          <View style={{ 
            backgroundColor: '#4CAF50', 
            padding: 20, 
            borderRadius: 8,
            marginBottom: 20
          }}>
            <Text style={{ color: 'white', fontSize: 18 }}>
              ✓ Lector Conectado
            </Text>
            <Text style={{ color: 'white', marginTop: 5 }}>
              Acerca el bastón a la caravana
            </Text>
          </View>

          {lastCaravana && (
            <View style={{ 
              backgroundColor: '#2196F3', 
              padding: 20, 
              borderRadius: 8,
              marginBottom: 20
            }}>
              <Text style={{ color: 'white', fontSize: 16 }}>
                Última caravana escaneada:
              </Text>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                {lastCaravana}
              </Text>
            </View>
          )}

          <Button
            title="Desconectar"
            onPress={disconnect}
            color="#f44336"
          />
        </>
      )}
    </View>
  );
}

export default ScanScreen;
```

---

## 🔍 Debugging

### Herramientas Útiles

1. **nRF Connect (App)** - Escanear dispositivos BLE y ver servicios/características
2. **Bluetooth Terminal** - Enviar/recibir datos raw
3. **React Native Debugger** - Ver logs de la app

### Logs Importantes

```javascript
// Habilitar logs BLE
import { LogLevel } from 'react-native-ble-plx';
manager.setLogLevel(LogLevel.Verbose);

// Ver todos los servicios del dispositivo
const services = await device.services();
console.log('Servicios:', services.map(s => s.uuid));

// Ver todas las características
for (const service of services) {
  const characteristics = await service.characteristics();
  console.log('Características:', characteristics.map(c => c.uuid));
}
```

---

## ⚠️ Problemas Comunes

### 1. No encuentra el lector
**Solución:** Asegúrate que:
- El lector está encendido
- Bluetooth está activado en el celular
- Los permisos están otorgados
- El lector no está conectado a otro dispositivo

### 2. Conexión se pierde
**Solución:**
- Implementar reconexión automática
- Verificar batería del lector
- Reducir distancia entre celular y lector

### 3. Datos corruptos
**Solución:**
- Verificar el formato de datos del fabricante
- Agregar validación de checksums
- Filtrar caracteres basura

---

## 📚 Recursos Adicionales

- **Allflex Docs:** https://www.allflex.global/support/
- **ISO 11784/11785:** Estándar de caravanas electrónicas
- **BLE PLX Docs:** https://github.com/dotintent/react-native-ble-plx

---

## 🎯 Próximos Pasos

1. Comprar un lector RFID compatible
2. Implementar el código de integración
3. Probar con caravanas reales
4. Ajustar parsing según fabricante
5. Agregar manejo de errores robusto
6. Documentar UUIDs específicos de tu hardware

---

**¿Necesitas ayuda con la integración?**  
Contacta: soporte@ganaderoapp.com
