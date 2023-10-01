import { receiveRawData, onDisconnect } from "./main.js";
import { nordicDfuHandleControlResponse } from "./nordicdfu.js";

let device = null;

let nordicDfuControlCharacteristic = null;
let nordicDfuPacketCharacteristic = null;
const nordicDfuServiceUuid = 0xfe59;
const nordicDfuControlCharacteristicUUID =
  "8ec90001-f315-4f60-9fb8-838830daea50";
const nordicDfuPacketCharacteristicUUID =
  "8ec90002-f315-4f60-9fb8-838830daea50";

let replRxCharacteristic = null;
let replTxCharacteristic = null;
const replDataServiceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const replRxCharacteristicUuid = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const replTxCharacteristicUuid = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

let rawDataRxCharacteristic = null;
let rawDataTxCharacteristic = null;
const rawDataServiceUuid = "e5700001-7bac-429a-b4ce-57ff900f479d";
const rawDataRxCharacteristicUuid = "e5700002-7bac-429a-b4ce-57ff900f479d";
const rawDataTxCharacteristicUuid = "e5700003-7bac-429a-b4ce-57ff900f479d";

export const replDataTxQueue = [];
export const rawDataTxQueue = [];

let replTxTaskIntervalId = null;
let replDataTxInProgress = false;
let rawDataTxInProgress = false;

let relayCallback;

// Web-Bluetooth doesn't have any MTU API, so we just set it to something reasonable
const max_mtu = 100;

export function isConnected() {
  if (device && device.gatt.connected) {
    return true;
  }

  return false;
}

export async function connect(relayCallbackArg) {
  if (!navigator.bluetooth) {
    return Promise.reject(
      "This browser doesn't support WebBluetooth. " +
      "Make sure you're on Chrome Desktop/Android or BlueFy iOS."
    );
  }

  relayCallback = relayCallbackArg;
  console.log("relayCallback");

  // Bluefy on ios currently doesn't allow multiple filters
  if (/iPhone|iPad/.test(navigator.userAgent)) {
    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
    });
  } else {
    device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: [replDataServiceUuid] },
        { services: [nordicDfuServiceUuid] },
      ],
      optionalServices: [rawDataServiceUuid],
    });
  }

  const server = await device.gatt.connect();
  device.addEventListener("gattserverdisconnected", disconnect);

  const nordicDfuService = await server
    .getPrimaryService(nordicDfuServiceUuid)
    .catch(() => { });
  const replService = await server
    .getPrimaryService(replDataServiceUuid)
    .catch(() => { });
  const rawDataService = await server
    .getPrimaryService(rawDataServiceUuid)
    .catch(() => { });

  if (nordicDfuService) {
    nordicDfuControlCharacteristic = await nordicDfuService.getCharacteristic(
      nordicDfuControlCharacteristicUUID
    );
    nordicDfuPacketCharacteristic = await nordicDfuService.getCharacteristic(
      nordicDfuPacketCharacteristicUUID
    );
    await nordicDfuControlCharacteristic.startNotifications();
    nordicDfuControlCharacteristic.addEventListener(
      "characteristicvaluechanged",
      receiveNordicDfuControlData
    );
    return Promise.resolve("dfu connected");
  }

  if (replService) {
    replRxCharacteristic = await replService.getCharacteristic(
      replRxCharacteristicUuid
    );
    replTxCharacteristic = await replService.getCharacteristic(
      replTxCharacteristicUuid
    );
    await replTxCharacteristic.startNotifications();
    replTxCharacteristic.addEventListener(
      "characteristicvaluechanged",
      receiveReplData
    );
    replTxTaskIntervalId = setInterval(transmitReplData);
  }

  if (rawDataService) {
    rawDataRxCharacteristic = await rawDataService.getCharacteristic(
      rawDataRxCharacteristicUuid
    );
    rawDataTxCharacteristic = await rawDataService.getCharacteristic(
      rawDataTxCharacteristicUuid
    );
    await rawDataTxCharacteristic.startNotifications();
    rawDataTxCharacteristic.addEventListener(
      "characteristicvaluechanged",
      receiveRawData
    );
  }

  return Promise.resolve("repl connected");
}

export async function disconnect() {
  if (device && device.gatt.connected) {
    await device.gatt.disconnect();
  }

  // Stop transmitting data
  clearInterval(replTxTaskIntervalId);

  // Callback to main.js
  onDisconnect();
}

function receiveNordicDfuControlData(event) {
  nordicDfuHandleControlResponse(event.target.value);
}

export async function transmitNordicDfuControlData(bytes) {
  await nordicDfuControlCharacteristic.writeValue(new Uint8Array(bytes));
}

export async function transmitNordicDfuPacketData(bytes) {
  await nordicDfuPacketCharacteristic.writeValueWithoutResponse(
    new Uint8Array(bytes)
  );
}

var decodedMsgSession = false
var chunks = []

function sendToBackend(result) {
  var formData = new FormData();
  const imageBlob = new Blob([result.buffer]);
  formData.append("file", imageBlob, "imageFile");
  formData.append('imageStyle', 'Van Gogh');
  formData.append('destEmail', 'saharhashai@gmail.com');

  for (var key of formData.entries()) {
    console.log(key[0] + ', ' + key[1]);
    }
    
  // Use the Fetch API to send a POST request to the Flask app
  fetch('http://127.0.0.1:5000/receive-img', {
    method: 'POST',
    body: formData,
  }).then(response => {
    if (response.ok) {
      console.log('Image successfully uploaded');
    } else {
      console.error('Upload failed with status ' + response.status);
    }
  }).catch(error => {
    console.error('Fetch error: ' + error);
  });
}

function receiveChunk(chunk) {
  // Push each chunk to the array
  chunks.push(chunk);
}

function allChunksReceived() {
  // Concatenate all chunks to create a single ArrayBuffer
  let totalSize = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  let result = new Uint8Array(totalSize);

  let offset = 0;
  for (let chunk of chunks) {
    result.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }

  sendToBackend(result);

  // Clear the chunks for next usage
  chunks = [];
}

function receiveReplData(event) {
  // Decode the byte array into a UTF-8 string
  const decoder = new TextDecoder("utf-8");
  const decodedMsg = decoder.decode(event.target.value);

  if (decodedMsgSession) {
    if (decodedMsg.includes("image_end")){
      allChunksReceived()
      console.log('finished audio session')
      decodedMsgSession = false
    } else{
      console.log('writing chunk', event.target.value.buffer)  
      receiveChunk(event.target.value.buffer)
    }    
  } else {
    if (decodedMsg.includes("image_start")) {
      console.log('entering audio session', decodedMsg)
      decodedMsgSession = true
    } else {
      relayCallback(decodedMsg);
    }
  }
}

async function transmitReplData() {
  if (replDataTxInProgress === true) {
    return;
  }

  if (replDataTxQueue.length === 0) {
    return;
  }

  replDataTxInProgress = true;

  const payload = replDataTxQueue.slice(0, max_mtu);

  await replRxCharacteristic
    .writeValueWithoutResponse(new Uint8Array(payload))
    .then(() => {
      replDataTxQueue.splice(0, payload.length);
      replDataTxInProgress = false;
      return;
    })

    .catch((error) => {
      if (error == "NetworkError: GATT operation already in progress.") {
        // Ignore busy errors. Just wait and try again later
      } else {
        // Discard data on other types of error
        replDataTxQueue.splice(0, payload.length);
        replDataTxInProgress = false;
        return Promise.reject(error);
      }
    });
}

// TODO
export async function transmitRawData(bytes) {
  await rawDataRxCharacteristic
    .writeValueWithoutResponse(new Uint8Array(bytes))
    .then(() => {
      console.log("Sent: ", bytes);
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}

window.transmitRawData = transmitRawData;
