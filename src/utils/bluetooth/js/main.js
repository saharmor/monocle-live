import { connect, disconnect, isConnected } from "./bluetooth.js";
import { startNordicDFU } from "./nordicdfu.js";


export async function ensureConnected(statusCallback, relayCallback) {
  console.log("connecting");
  if (isConnected() === true) {
    return;
  }

  try {
    console.log("trying to connect");
    let connectionResult = await connect(relayCallback);

    if (connectionResult === "dfu connected") {
      statusCallback("Starting firmware update..");

      await startNordicDFU().catch(() => {
        console.warn("Bluetooth error. Reconnect or check console for details");
        disconnect();
        throw "Bluetooth error. Reconnect or check console for details";
      });
      disconnect();
    }

    if (connectionResult === "repl connected") {
      statusCallback("Connected");
    }
  } catch (error) {
    // Ignore User cancelled errors
    if (error.message && error.message.includes("cancelled")) {
      return;
    }
    statusCallback(JSON.stringify(error));
    console.error(error);
  }
}

export function reportUpdatePercentage(percentage, statusCallback) {
  statusCallback("Updating " + percentage + "%..");
}




function sendToBackend(result){
  let blob = new Blob([result.buffer], { type: 'image/jpeg' });

    // Use the Fetch API to send a POST request to the Flask app
    fetch('http://127.0.0.1:5000/receive-img', {
        method: 'POST',
        body: blob,
        headers: {
            'Content-Type': 'audio/wav'
        }
    }).then(response => {
        if(response.ok) {
            console.log('Audio successfully uploaded');
        } else {
            console.error('Upload failed with status ' + response.status);
        }
    }).catch(error => {
        console.error('Fetch error: ' + error);
    });
}

var chunks = []

function receiveChunk(chunk) {
  // Push each chunk to the array
  chunks.push(chunk);
}

function allChunksReceived() {
  // Concatenate all chunks to create a single ArrayBuffer
  let totalSize = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  let result = new Uint8Array(totalSize);
  
  let offset = 0;
  for(let chunk of chunks) {
      result.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
  }
  debugger
  sendToBackend(result);

  // Clear the chunks for next usage
  chunks = [];
}


export function receiveRawData(event) {
  // receiveChunk(event.target.value.buffer)
  // if (event.target.value.byteLength<253){
  //   allChunksReceived()
  // }
  console.log(event.target.value);
}

export function onDisconnect(statusCallback) {
  statusCallback("Disconnected");
}
