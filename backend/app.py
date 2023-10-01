import ast
from curses import raw
from flask import Flask, request
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


def clean_image_data(image_data):
    # Transform the input byte array into a list for easier manipulation
    byte_list = list(image_data)[2:]  # remove unnecessary prefix (b')

    # # Define the sequence to truncate after
    # end_sequence = [0xFF, 0xD9]

    # # Check if the sequence is in the byte array
    # if end_sequence[0] in byte_list:
    #     # Find the first index of the end sequence
    #     index = byte_list.index(end_sequence[0])

    #     # Check if the sequence is not at the end of the byte array
    #     if index < len(byte_list) - 1:
    #         # If the next byte matches the second part of the end sequence, truncate the byte array
    #         if byte_list[index + 1] == end_sequence[1]:
    #             byte_list = byte_list[: index + 2]

    # Convert the list back to bytes
    truncated_byte_array = bytes(byte_list)

    return truncated_byte_array


@app.route("/receive-img", methods=["POST"])
def receive_image():
    image_data = request.files["file"]
    dest_email = request.form.get("destEmail")
    image_style = request.form.get("imageStyle")

    cleaned_image_data = clean_image_data(image_data.read())
    output_wav_recording = f"recording_NEW.wav"
    # byte_content = bytes(cleaned_image_data.decode("unicode_escape"), "latin1")

    raw_bytes_file = "audio.raw"
    print("Audio file size in bytes", len(cleaned_image_data))

    with open(raw_bytes_file, "wb") as f:
        f.write(cleaned_image_data)

    os.remove(output_wav_recording)
    os.system(
        f"ffmpeg -y -f s16be -ar 16000 -i {raw_bytes_file} {output_wav_recording}"
    )

    import subprocess

    subprocess.call(["open", output_wav_recording])

    return "Hello, print me on Monocle!"


if __name__ == "__main__":
    app.run(port=8000)
