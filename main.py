import touch
import display

def change_text(button):
    new_text = display.Text(f"Button {button} touched!", 0, 0, display.WHITE)
    display.show(new_text)

touch.callback(touch.EITHER, change_text)

initial_text = display.Text("Tap a touch button", 0, 0, display.WHITE)
display.show(initial_text)