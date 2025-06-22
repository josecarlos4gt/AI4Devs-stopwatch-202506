# Herramienta
Gemini, 2.5 Flash

# Prompt
As a senior software developer, create a webpage with two options: Stopwatch and Countdown. Both technical criteria:
1.	Separate the html and javascript code into index.html and script.js
2.	Apply the SOLID principles
3.	Implement all necesary logs in the console
4.	Catch all possible exceptions
5.	Make it responsive website
Functional criteria:
1.	There will two icons and buttons, one for Stopwatch, another for Countdown
2.	When the user press Stopwatch, a form will appear, this should look like the stopwatch.png file
3.	The Stopwatch form will work as a Stopwatch:
- when the Start button is pressed by the user the time begins to pass, this must be seen in real time, and the Start converts into a Pause button,
- when the user presses the Pause button the time countdown pauses,
- when the user presses the Clear button, the time is reset and if the Pause button is showing it returns to Start button 
- this form should have a back button to back to the Stopwatch / Countdown forms
4.	When the user presses the Countdown button, a form will appear, this should like the countdown.png file
5.	The Countdown form will work a Countdown:
- The user presses the numbers buttons, and each number will appear in the time label. Each number pressed begins to fill the label, moving the numbers already placed adding to the right, moving the others
- when the user presses the Set button the form becomes Stopwatch forms, with a Start button, a Clear button and the time, but the time is the set by the user in the previous step,
- when the Start button is pressed by the user the time begins to countdown, this must be seen in real time, and the Start converts into a Pause button
- when the Pause is presses by the user, the countdown must be pause and the Continue button becomes into a Continue button,
- when the user presses the Continue button, the time continues the countdown and the Continue button becomes the Pause button
- when the user presses the Clear button, the time is reset to the user’s input and if the Pause or Continue button is showing it returns to Start button 
- this form should have a back button to back to the Stopwatch / Countdown forms
General criteria:
1.	It should look elegant with a color palette that is pleasing to the eye.
Ask me all the extra information that you need before build it

# Preguntas de la IA
Before I proceed with generating the code, I'd like to clarify a few points to ensure the best possible outcome:
1.	Time Format: For both the Stopwatch and Countdown, the images show HH:MM:SS. Is this the desired format, or would you like to include milliseconds as shown in the 000 small text in the bottom right of the time display?
2.	Countdown Input Limit: Is there a maximum time the user can input for the countdown? For example, should it be limited to 24 hours, or a specific number of digits?
3.	Color Palette Details: You mentioned "elegant with a color palette that is pleasing to the eye." Do you have any specific color preferences or a general theme (e.g., modern, minimalist, dark mode, light mode) you'd like to lean towards?
4.	Font for Numbers: The numbers in the images appear to be a specific, bold, digital-like font. Do you have a preference for a similar font, or should I choose a readily available web-safe font that looks good?
5.	Icons: You mentioned "two icons and buttons." Do you have specific icons in mind (e.g., from Font Awesome, Material Icons, or just simple text for now)?
Once I have this additional information, I can start building the index.html and script.js files, focusing on SOLID principles, error handling, logging, and responsiveness.

# Respuestas
1.	Time format HH:MM:SS with milliseconds in the bottom right corner is fine
2.	It is right, 24 hours should be enough
3.	Modern colors should be right
4.	Use any font you consider appropriate
5.	Use any icons you consider appropriate
