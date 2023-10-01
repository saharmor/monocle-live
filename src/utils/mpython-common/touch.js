export const touch = () => {
  // const snippet = [
  //   'def callbackA(arg):',
  //   '  print("trigger a")',
  //   'def callbackB(arg):',
  //   '  print("trigger b")',
  //   `touch.callback(touch.A, callbackA)`,
  //   `touch.callback(touch.B, callbackB)`
  // ];
  const snippet = [
'import touch', 
'import display', 
'import microphone', 
'import bluetooth', 
'import time', 


'def start_stream(button):', 
'    if button == touch.A:',
'        print(\'image_start\')',
'        new_text = display.Text(f"Starting streaming translation", 0, 0, display.WHITE)', 
'        display.show(new_text)', 

'        raw = microphone.record(seconds=5.0, sample_rate=16000, bit_depth=16)', 
'        time.sleep(0.5)', 
'        samples = bluetooth.max_length() // 2', 
'        while True:', 
'            chunk1 = microphone.read(samples)', 
'            chunk2 = microphone.read(samples)', 

'            if chunk1 == None:',               
// '                if chunk2 != None:',
// '                   print(chunk2)',
'                break', 
'            elif chunk2 == None:', 
'                print(chunk1)', 
'            else:', 
'                print(chunk1 + chunk2)', 

'        new_text = display.Text(f"Done loop", 0, 0, display.WHITE)', 
'        display.show(new_text)', 

'        print("image_end")',

// '    if button == touch.B:',
// '        new_text = display.Text(f"Ending stream", 0, 0, display.WHITE)', 
// '        display.show(new_text)', 
// '        print("image_end")',


// 'def end_stream(button):', 
// '    print("ending stream")',
// '    streaming = False', 

'touch.callback(touch.EITHER, start_stream)', 
// 'touch.callback(touch.B, end_stream)', 

'initial_text = display.Text("Tap a touch button to start conversation", 0, 0, display.WHITE)', 
'display.show(initial_text)'

// 'import touch',
// 'def take_pic(button):',
// '    import _camera',
// '    import time',
// '    import fpga',
// '    import struct',
// '    import bluetooth',

// '    def capture():',
// '        _camera.wake()',
// '        time.sleep_ms(1200)',
// '        fpga.write(0x1003, b"")',
// '        while fpga.read(0x1000, 1) == b"2":',
// '            time.sleep_ms(1500)',

// '    def read(bytes=254):',
// '        if bytes > 254:',
// '            raise ValueError("at most 254 bytes")',

// '        avail = struct.unpack(">H", fpga.read(0x1006, 2))[0]',
// '        if avail == 0:',
// '            _camera.sleep()',
// '            return None',

// '        data = fpga.read(0x1007, min(bytes, avail))',
// '        print(data)',
// '        return True if avail != 0 else False',

// '    capture()',
// '    print(\'image_start\')',
// '    time.sleep(2)',
// '    while data := read(bluetooth.max_length()):',
// '        pass',
// '        print(data)',
// '        bluetooth.send(data)',
// 'touch.callback(touch.A, take_pic)',
    // 'def take_pic(url):',
    // '    import _camera',
    // '    import time',
    // '    import fpga',
    // '    import struct',
    // '    import bluetooth',
    // '    __camera.wake()',
    // '    fpga.write(0x1009, b\'\') # camera on',
    // '    fpga.write(0x1006, b\'\') # camera capture',
    // '    time.sleep_ms(60) # let the FPGA work a bit',
    // '    buffer = bytearray(bluetooth.max_length())',
    // '    buffer[1:4] = b\'\\x00\\x00\\x00\\x00\' # file size',
    // '    flag = 1 # START',
    // '    offset = 5',
    // '    while True:',
    // '        # Read the bytes remaining in the fifo',
    // '        length_bytes = fpga.read(0x5000, 2)',
    // '        length = (length_bytes[0] << 8 | length_bytes[1]) & 0x0FFF',
    // '        if length == 0:',
    // '            break',
    // '        if length > bluetooth.max_length() - offset:',
    // '            length = bluetooth.max_length() - offset',
    // '        else:',
    // '            flag = 0 if (flag == 1) else 3 # SMALL or END',
    // '        buffer[0] = flag',
    // '        buffer[offset:] = fpga.read(0x5010, length)',
    // '        while True:',
    // '            try:',
    // '                bluetooth.send(buffer)',
    // '            except OSError:',
    // '                continue',
    // '            break',
    // '        offset = 1',
    // '        flag = 2 # MIDDLE',
    // '    __camera.sleep()',
    // '    gc.collect()',
    // 'touch.callback(touch.A, take_pic)',
  ];

  return snippet.join('\n');
}