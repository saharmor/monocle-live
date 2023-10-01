import touch
import display
import microphone
import bluetooth
import time


streaming = False


def start_stream(button):
    streaming = True
    new_text = display.Text(f"Starting streaming translation", 0, 0, display.WHITE)
    display.show(new_text)

    raw = microphone.record(seconds=1.0, sample_rate=16000, bit_depth=16)
    time.sleep(0.5)
    samples = bluetooth.max_length() // 2
    while streaming:
        new_text = display.Text(f"In loop", 0, 0, display.WHITE)
        display.show(new_text)
        chunk1 = microphone.read(samples)
        chunk2 = microphone.read(samples)

        if chunk1 == None:
            new_text = display.Text(f"Chunk 1", 0, 0, display.WHITE)
            display.show(new_text)
            break
        elif chunk2 == None:
            new_text = display.Text(f"Chunk 2", 0, 0, display.WHITE)
            display.show(new_text)
            print(chunk1)
        else:
            new_text = display.Text(f"Chunk 1 & Chunk 2", 0, 0, display.WHITE)
            print(chunk1 + chunk2)

        new_text = display.Text(f"Done loop", 0, 0, display.WHITE)
        display.show(new_text)


def end_stream(button):
    streaming = False


touch.callback(touch.A, start_stream)
touch.callback(touch.B, end_stream)

initial_text = display.Text("Tap a touch button", 0, 0, display.WHITE)
display.show(initial_text)
